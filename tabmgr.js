chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);

chrome.commands.onCommand.addListener(async command => {
    switch(command) {
        case "newTab":
            await newTab();
            break;
        case "move":
            await move();
            break;
        case "close":
            await closeCurrent();
            break;
        case "closeElse":
            await closeElse();
            break;
        case "expand":
            await chrome.storage.session.set({ collapse: false });
            await update((await getCurrentTab()).groupId);
            break;
        case "collapse":
            await chrome.storage.session.set({ collapse: true });
            await update((await getCurrentTab()).groupId);
            break;
    }
});

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });
    return tab;
}

async function update(gid) {
    if(gid < 0) { return; }
    await chrome.storage.session.set({ lastGid: gid });
    let collapse = (await chrome.storage.session.get(["collapse"])).collapse;
    let groups = await chrome.tabGroups.query({});
    groups.forEach(async g => {
        if (g.id == gid) { return; }
        await chrome.tabGroups.update(g.id, {
            collapsed: collapse,
        });
    });
}

async function init() {
    let tabs = (await chrome.tabs.query({
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
    })).map(tab => tab.id);
    if (tabs.length < 1) { return; }
    let groupId = await chrome.tabs.group({ tabIds: tabs });
    update(groupId);
    await chrome.storage.session.set({
        lastGid: -1,
        collapse: true,
    })
}

chrome.tabs.onActivated.addListener(async info => {
    setTimeout(async() => {
        try { update((await chrome.tabs.get(info.tabId))?.groupId ?? -1); }
        catch(_) {}
    }, 150);
});

chrome.tabs.onUpdated.addListener(async(_, info, tab) => {
    if(info.groupId == undefined) { return; }
    if(tab.active) { await update(tab.groupId); }
});

let stop = false

chrome.tabs.onCreated.addListener(async tab => {
    if(stop) { return; }
    let lastGid = (await chrome.storage.session.get(["lastGid"])).lastGid;
    if(lastGid < 0) { return; }
    chrome.tabs.group({
        groupId: lastGid,
        tabIds: tab.id,
    });;
});

async function newTab() {
    stop = true;
    let tabId = (await chrome.tabs.create({})).id;
    await chrome.tabs.ungroup(tabId);
    await chrome.tabs.group({ tabIds: tabId });
    stop = false;
}

async function move() {
    let tabId = (await getCurrentTab())?.id;
    if(tabId == undefined) { return; }
    await chrome.tabs.ungroup(tabId);
    await chrome.tabs.group({ tabIds: tabId });
}

async function closeElse() {
    let lastGid = (await chrome.storage.session.get(["lastGid"])).lastGid;
    let tabs = (await chrome.tabs.query({}))
        .filter(tab => tab.groupId != lastGid)
        .map(tab => tab.id);
    console.log(tabs);
    await chrome.tabs.remove(tabs);
}

async function closeCurrent() {
    let gid = (await getCurrentTab())?.groupId ?? -1;
    let tabs = (await chrome.tabs.query({ groupId: gid }))
        .map(tab => tab.id);
    await chrome.tabs.remove(tabs);
}