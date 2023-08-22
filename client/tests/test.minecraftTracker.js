const { checkServer } = require('../events/minecraftTracker.js');

async function testMinecraftTracker() {
    console.log(`running test 1 for minecraftTracker`);
    await checkServer()
    .then((res) => {
        console.log(`finished test 1 for minecraftTracker with response ${res}`);
    }).catch((err) => {
        console.error(err);
    })
}

testMinecraftTracker();