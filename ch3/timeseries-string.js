module.exports = class TimeSeries {
    constructor(client, namespace) {
        this.client = client;
        this.namespace = namespace;
        this.units = {
            second: 1,
            minute: 60,
            hour: 60 * 60,
            day: 24 * 60 * 60
        };
        this.granularities = {
            '1sec': {
                name: '1sec',
                ttl: this.units.hour * 2,
                duration: this.units.second
            },
            '1min': {
                name: '1min',
                ttl: this.units.day * 7,
                duration: this.units.minute
            },
            '1hour': {
                name: '1hour',
                ttl: this.units.day * 60,
                duration: this.units.hour
            },
            '1day': {
                name: '1day',
                ttl: null,
                duration: this.units.day
            }
        };
    }

    insert(timestampInSeconds) {
        for (let granularityName in this.granularities) {
            let granularity = this.granularities[granularityName];
            let key = this._getKeyName(granularity, timestampInSeconds);
            this.client.incr(key);
            if (granularity.ttl !== null) {
                this.client.expire(key, granularity.ttl);
            }
        }
    }

    _getKeyName(granularity, timestampInSeconds) {
        const roundedTimestamp = this._getRoundedTimestamp(
            timestampInSeconds,
            granularity.duration
        );
        return [this.namespace, granularity.name, roundedTimestamp].join(':');
    }

    _getRoundedTimestamp(timestampInSeconds, precision) {
        return Math.floor(timestampInSeconds / precision) * precision;
    }

    fetch(granularityName, beginTimestamp, endTimestamp, onComplete) {
        const granularity = this.granularities[granularityName];
        const begin = this._getRoundedTimestamp(
            beginTimestamp,
            granularity.duration
        );
        const end = this._getRoundedTimestamp(
            endTimestamp,
            granularity.duration
        );
        let keys = [];

        for (let timestamp = begin; timestamp <= end; timestamp += granularity.duration) {
            const key = this._getKeyName(granularity, timestamp);
            keys.push(key);
        }

        this.client.mget(keys, function (err, replies) {
            let results = [];
            for (let i = 0; i < replies.length; ++i) {
                let timestamp = beginTimestamp + i * granularity.duration;
                let value = parseInt(replies[i], 10) || 0;
                results.push({ timestamp: timestamp, value: value });
            }
            onComplete(granularityName, results);
        });
    }
}
