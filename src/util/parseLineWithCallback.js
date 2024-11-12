const parseLineWithCallback = (data, callback) => data.split('\n').slice(1, -1).map(callback);

export default parseLineWithCallback;
