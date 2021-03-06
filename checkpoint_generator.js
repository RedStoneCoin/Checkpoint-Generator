const fs = require('fs'),
      { TurtleCoind } = require('turtlecoin-rpc');

const daemon = new TurtleCoind({
	host: '127.0.0.1', // ip address or hostname of the Telluriumd host
	port: 44402, // what port is the RPC server running on
	timeout: 30000, // request timeout
	ssl: false // whether we need to connect using SSL/TLS
});

class Checkpoint {
	constructor(height, hash) {
		this.height = height;
		this.hash = hash;
	}
}

var checkpoints = [];

daemon.getBlockCount().then(async (height) => {
	await console.log("Got blockheight " + height + "!");

	for (let i = 1; i < height; i++) {
		await console.log("Getting block info for height " + i);

		const blockHash = await daemon.getBlockHash({
			height: i
		})

		await checkpoints.push(new Checkpoint(i - 1, blockHash));
	}

	console.log('Got', checkpoints.length, 'checkpoints from 0 to', checkpoints[checkpoints.length - 1].height, 'blocks');

	let csv = ''
	let codecheckpoints = ''

	for (const checkpoint of checkpoints) {
		csv += `${checkpoint.height},${checkpoint.hash}\n`
	}
	for (const checkpoint_code of checkpoints) {
		codecheckpoints += `{` + checkpoint_code.height + `,"` + checkpoint_code.hash + `"},\n`
	}


	const buffer = Buffer.from(csv, 'ascii');
	const buffer_code = Buffer.from(codecheckpoints, 'ascii');
       
	fs.open('checkpoints.csv', 'w', (err, fd) => {
		if (err) throw err

		console.log('Opened checkpoints.csv!');

		fs.write(fd, buffer, 0, buffer.byteLength, 0, (err, bytes) => {
			if(err) throw err;

			console.log('Wrote', Math.floor(bytes / 1024), ' kilobytes');

			fs.close(fd, (err) => {
				console.log('Closed checkpoints.csv!');
			});
		});
	})
	fs.open('checkpoints_code.txt', 'w', (err, fd) => {
		if (err) throw err

		console.log('Opened checkpoints_code.txt!');

		fs.write(fd, buffer_code, 0, buffer_code.byteLength, 0, (err, bytes) => {
			if(err) throw err;

			console.log('Wrote', Math.floor(bytes / 1024), ' kilobytes');

			fs.close(fd, (err) => {
				console.log('Closed checkpoints.txt!');
			});
		});
	})
})
.catch((error) => {
	throw new Error(`An error occurred whilst getting height of the blockchain : ${error}`);
});
