const GlobalSettings = require('../models/GlobalSettings');

let timeoutId = null;

const startLiveListingWorker = async () => {
    console.log('Starting Live Listing Worker...');

    // Auto-migrate: if old interval values (2s-5s) stored in DB, update to new (5s-10s)
    try {
        const existing = await GlobalSettings.findOne();
        if (existing) {
            let needsSave = false;
            if (existing.liveListingMinInterval < 5000) {
                existing.liveListingMinInterval = 5000;
                needsSave = true;
            }
            if (existing.liveListingMaxInterval < 10000) {
                existing.liveListingMaxInterval = 10000;
                needsSave = true;
            }
            if (needsSave) {
                await existing.save();
                console.log('Live Listing Worker: Updated interval to 5–10 seconds.');
            }
        }
    } catch (migErr) {
        console.error('Live Listing Worker: Migration error:', migErr);
    }

    const run = async () => {
        try {
            let settings = await GlobalSettings.findOne();
            if (!settings) {
                settings = await GlobalSettings.create({});
            }

            if (settings.liveListingEnabled) {
                // Use IST hours (UTC+5:30)
                const now = new Date();
                const istOffset = 5.5 * 60 * 60 * 1000;
                const istDate = new Date(now.getTime() + istOffset);
                const hours = istDate.getUTCHours();

                // Only run between 10 AM and 7 PM IST (stop at 19:00)
                if (hours >= settings.liveListingStartTime && hours < settings.liveListingEndTime) {
                    const increment = Math.floor(Math.random() * (settings.liveListingMaxIncrement - settings.liveListingMinIncrement + 1)) + settings.liveListingMinIncrement;

                    settings.liveListingCurrent += increment;
                    settings.updatedAt = Date.now();
                    await settings.save();

                    console.log(`Live Listing Incremented by ${increment}. Current: ${settings.liveListingCurrent}`);
                } else {
                    console.log(`Live Listing Worker: Outside active hours (${hours}:00 IST). Sleeping...`);
                }
            }

            // Schedule next run: random between 5–10 seconds
            const interval = Math.floor(Math.random() * (settings.liveListingMaxInterval - settings.liveListingMinInterval + 1)) + settings.liveListingMinInterval;

            timeoutId = setTimeout(run, interval);
        } catch (err) {
            console.error('Error in Live Listing Worker:', err);
            // Retry after 10 seconds if error
            timeoutId = setTimeout(run, 10000);
        }
    };

    run();
};

const stopLiveListingWorker = () => {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
};

module.exports = { startLiveListingWorker, stopLiveListingWorker };
