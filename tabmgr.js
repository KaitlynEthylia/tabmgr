chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);

let lastGid = -1;
let collapse = true;

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
            collapse = false;
            await update((await getCurrentTab()).groupId);
            break;
        case "collapse":
            collapse = true;
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
    lastGid = gid;
    let groups = await chrome.tabGroups.query({});
    groups.forEach(async g => {
        if (g.id == lastGid) { return; }
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
}

chrome.tabs.onActivated.addListener(async info => {
    setTimeout(async() => {
        update((await chrome.tabs.get(info.tabId))?.groupId ?? -1);
    }, 150);
});

chrome.tabs.onUpdated.addListener((_, info, tab) => {
    if(info.groupId == undefined) { return; }
    if(tab.active) { update(tab.groupId); }
});

chrome.tabs.onCreated.addListener(tab => {
    if(lastGid < 0) { return; }
    chrome.tabs.group({
        groupId: lastGid,
        tabIds: tab.id,
    });;
});

async function newTab() {
    let tabId = (await chrome.tabs.create({})).id;
    await chrome.tabs.ungroup(tabId);
    await chrome.tabs.group({ tabIds: tabId });
}

async function move() {
    let tabId = (await getCurrentTab())?.id;
    if(tabId == undefined) { return; }
    await chrome.tabs.ungroup(tabId);
    await chrome.tabs.group({ tabIds: tabId });
}

async function closeElse() {
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