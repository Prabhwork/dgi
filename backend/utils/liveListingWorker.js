const GlobalSettings = require('../models/GlobalSettings');

let timeoutId = null;

const startLiveListingWorker = async () => {
    console.log('Starting Live Listing Worker...');
    
    const run = async () => {
        try {
            let settings = await GlobalSettings.findOne();
            if (!settings) {
                settings = await GlobalSettings.create({});
            }

            if (settings.liveListingEnabled) {
                const now = new Date();
                const hours = now.getHours();

                // Check if within office hours (10 AM - 7 PM)
                if (hours >= settings.liveListingStartTime && hours < settings.liveListingEndTime) {
                    const increment = Math.floor(Math.random() * (settings.liveListingMaxIncrement - settings.liveListingMinIncrement + 1)) + settings.liveListingMinIncrement;
                    
                    settings.liveListingCurrent += increment;
                    settings.updatedAt = Date.now();
                    await settings.save();
                    
                    console.log(`Live Listing Incremented by ${increment}. Current: ${settings.liveListingCurrent}`);
                }
            }

            // Schedule next run
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
