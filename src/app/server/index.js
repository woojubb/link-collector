import express from 'express';
import _ from 'lodash';
import apiHandler from "./api";

export default class Server {
	_context = null;
	_express = null;

	constructor({ context }) {
		this._context = context;

		this._initialize();
	}

	start = () => {
		const {httpPort} = this._context.config.server;
		this._express.listen(httpPort, () => {
			this._context.console.log('listening http on port: ' + httpPort);
		});
	}

	_initialize = () => {
		this._express = express();
		this._express.use((err, req, res, next) => {
			this._context.console.log('error', err);
			if (err) {
				res.status(400).send(err.message);
			}
		});

		this._express.use(express.json());
		this._express.use(express.urlencoded({ extended: false }));

		this._express.use(this._contextMiddleware);
		this._express.use("/api", apiHandler);

	}

	_contextMiddleware = (req, res, next) => {
		res._context = this._context;
		next();
	}
}
