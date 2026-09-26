var multiwidget = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region src/util.ts
	function buildRuntimeConfig() {
		const configScript = document.getElementById("reactedge-runtime");
		if (!configScript) return;
		let config;
		try {
			config = JSON.parse(configScript.textContent || "");
		} catch {
			return;
		}
		return config;
	}
	function stripMeta(contract) {
		const { _meta, ...cleanContract } = contract;
		return cleanContract;
	}
	//#endregion
	//#region ../../../packages/widget-build/shared-resources/framework/activity/activity.guard.ts
	function getDebugTargets() {
		if (typeof window === "undefined") return [];
		const value = new URLSearchParams(window.location.search).get("reactedge_debug");
		if (!value) return null;
		if (value === "1" || value === "all") return ["all"];
		return value.split(",").map((v) => v.trim().toLowerCase());
	}
	//#endregion
	//#region ../../../packages/widget-build/shared-resources/framework/activity/index.ts
	var WidgetActivity = class {
		widgetId;
		instance;
		correlationId;
		constructor(widgetId, instance) {
			this.widgetId = widgetId;
			if (instance !== void 0) this.instance = instance;
		}
		log(phase, message, data, level = "info") {
			const payload = {
				widget: this.widgetId,
				instance: this.instance ?? this.widgetId,
				phase,
				message,
				level,
				data,
				ts: Date.now()
			};
			if (this.isEnabled()) {
				const prefix = `[${this.widgetId}] ${phase}`;
				if (level === "error") console.error(prefix, payload);
				else if (level === "warn") console.warn(prefix, payload);
				else console.log(prefix, payload);
				this.dispatchActivityEvent(payload);
			}
		}
		group(title, values) {
			if (!this.isEnabled()) return;
			console.group(`[ReactEdge] ${title}`);
			if (values) for (const [key, value] of Object.entries(values)) console.log(`${key}:`, value);
			console.groupEnd();
		}
		debug(title, values) {
			if (!this.isEnabled()) return;
			console.group(`[ReactEdge] ${title}`);
			if (values) for (const [key, value] of Object.entries(values)) console.debug(`${key}:`, value);
		}
		ready() {
			const phase = "widget-ready";
			const payload = {
				widget: this.widgetId,
				instance: this.instance ?? this.widgetId,
				phase,
				message: "The widget is now ready to take over the SSR",
				level: "info",
				data: null,
				ts: Date.now()
			};
			if (this.isEnabled()) {
				const prefix = `[${this.widgetId}] ${phase}`;
				console.log(prefix, payload);
			}
			this.dispatchActivityEvent(payload);
		}
		dispatchActivityEvent(payload) {
			if (typeof window === "undefined") return;
			window.dispatchEvent(new CustomEvent("reactedge:activity", { detail: payload }));
		}
		isEnabled() {
			const debugTargets = getDebugTargets();
			return debugTargets !== null && (debugTargets.includes("all") || debugTargets.includes(this.widgetId.toLowerCase()));
		}
		setCorrelationId(id) {
			this.correlationId = id;
		}
		getCorrelationId() {
			return this.correlationId;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/version.js
	var VERSION$3 = "1.9.1";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/internal/semver.js
	var re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
	/**
	* Create a function to test an API version to see if it is compatible with the provided ownVersion.
	*
	* The returned function has the following semantics:
	* - Exact match is always compatible
	* - Major versions must match exactly
	*    - 1.x package cannot use global 2.x package
	*    - 2.x package cannot use global 1.x package
	* - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
	*    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
	*    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
	* - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
	* - Patch and build tag differences are not considered at this time
	*
	* @param ownVersion version which should be checked against
	*/
	function _makeCompatibilityCheck(ownVersion) {
		const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
		const rejectedVersions = /* @__PURE__ */ new Set();
		const myVersionMatch = ownVersion.match(re);
		if (!myVersionMatch) return () => false;
		const ownVersionParsed = {
			major: +myVersionMatch[1],
			minor: +myVersionMatch[2],
			patch: +myVersionMatch[3],
			prerelease: myVersionMatch[4]
		};
		if (ownVersionParsed.prerelease != null) return function isExactmatch(globalVersion) {
			return globalVersion === ownVersion;
		};
		function _reject(v) {
			rejectedVersions.add(v);
			return false;
		}
		function _accept(v) {
			acceptedVersions.add(v);
			return true;
		}
		return function isCompatible(globalVersion) {
			if (acceptedVersions.has(globalVersion)) return true;
			if (rejectedVersions.has(globalVersion)) return false;
			const globalVersionMatch = globalVersion.match(re);
			if (!globalVersionMatch) return _reject(globalVersion);
			const globalVersionParsed = {
				major: +globalVersionMatch[1],
				minor: +globalVersionMatch[2],
				patch: +globalVersionMatch[3],
				prerelease: globalVersionMatch[4]
			};
			if (globalVersionParsed.prerelease != null) return _reject(globalVersion);
			if (ownVersionParsed.major !== globalVersionParsed.major) return _reject(globalVersion);
			if (ownVersionParsed.major === 0) {
				if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) return _accept(globalVersion);
				return _reject(globalVersion);
			}
			if (ownVersionParsed.minor <= globalVersionParsed.minor) return _accept(globalVersion);
			return _reject(globalVersion);
		};
	}
	/**
	* Test an API version to see if it is compatible with this API.
	*
	* - Exact match is always compatible
	* - Major versions must match exactly
	*    - 1.x package cannot use global 2.x package
	*    - 2.x package cannot use global 1.x package
	* - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
	*    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
	*    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
	* - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
	* - Patch and build tag differences are not considered at this time
	*
	* @param version version of the API requesting an instance of the global API
	*/
	var isCompatible = _makeCompatibilityCheck(VERSION$3);
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
	var major = VERSION$3.split(".")[0];
	var GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(`opentelemetry.js.api.${major}`);
	var _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
	function registerGlobal(type, instance, diag, allowOverride = false) {
		var _a;
		const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : { version: VERSION$3 };
		if (!allowOverride && api[type]) {
			const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
			diag.error(err.stack || err.message);
			return false;
		}
		if (api.version !== "1.9.1") {
			const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION$3}`);
			diag.error(err.stack || err.message);
			return false;
		}
		api[type] = instance;
		diag.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION$3}.`);
		return true;
	}
	function getGlobal(type) {
		var _a, _b;
		const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
		if (!globalVersion || !isCompatible(globalVersion)) return;
		return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
	}
	function unregisterGlobal(type, diag) {
		diag.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION$3}.`);
		const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
		if (api) delete api[type];
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
	/**
	* Component Logger which is meant to be used as part of any component which
	* will add automatically additional namespace in front of the log message.
	* It will then forward all message to global diag logger
	* @example
	* const cLogger = diag.createComponentLogger({ namespace: '@opentelemetry/instrumentation-http' });
	* cLogger.debug('test');
	* // @opentelemetry/instrumentation-http test
	*/
	var DiagComponentLogger = class {
		constructor(props) {
			this._namespace = props.namespace || "DiagComponentLogger";
		}
		debug(...args) {
			return logProxy("debug", this._namespace, args);
		}
		error(...args) {
			return logProxy("error", this._namespace, args);
		}
		info(...args) {
			return logProxy("info", this._namespace, args);
		}
		warn(...args) {
			return logProxy("warn", this._namespace, args);
		}
		verbose(...args) {
			return logProxy("verbose", this._namespace, args);
		}
	};
	function logProxy(funcName, namespace, args) {
		const logger = getGlobal("diag");
		if (!logger) return;
		return logger[funcName](namespace, ...args);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/diag/types.js
	/**
	* Defines the available internal logging levels for the diagnostic logger, the numeric values
	* of the levels are defined to match the original values from the initial LogLevel to avoid
	* compatibility/migration issues for any implementation that assume the numeric ordering.
	*/
	var DiagLogLevel;
	(function(DiagLogLevel) {
		/** Diagnostic Logging level setting to disable all logging (except and forced logs) */
		DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
		/** Identifies an error scenario */
		DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
		/** Identifies a warning scenario */
		DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
		/** General informational log message */
		DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
		/** General debug log message */
		DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
		/**
		* Detailed trace level logging should only be used for development, should only be set
		* in a development environment.
		*/
		DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
		/** Used to set the logging level to include all logging */
		DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
	})(DiagLogLevel || (DiagLogLevel = {}));
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
	function createLogLevelDiagLogger(maxLevel, logger) {
		if (maxLevel < DiagLogLevel.NONE) maxLevel = DiagLogLevel.NONE;
		else if (maxLevel > DiagLogLevel.ALL) maxLevel = DiagLogLevel.ALL;
		logger = logger || {};
		function _filterFunc(funcName, theLevel) {
			const theFunc = logger[funcName];
			if (typeof theFunc === "function" && maxLevel >= theLevel) return theFunc.bind(logger);
			return function() {};
		}
		return {
			error: _filterFunc("error", DiagLogLevel.ERROR),
			warn: _filterFunc("warn", DiagLogLevel.WARN),
			info: _filterFunc("info", DiagLogLevel.INFO),
			debug: _filterFunc("debug", DiagLogLevel.DEBUG),
			verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
		};
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/api/diag.js
	var API_NAME$3 = "diag";
	/**
	* Singleton object which represents the entry point to the OpenTelemetry internal
	* diagnostic API
	*
	* @since 1.0.0
	*/
	var DiagAPI = class DiagAPI {
		/** Get the singleton instance of the DiagAPI API */
		static instance() {
			if (!this._instance) this._instance = new DiagAPI();
			return this._instance;
		}
		/**
		* Private internal constructor
		* @private
		*/
		constructor() {
			function _logProxy(funcName) {
				return function(...args) {
					const logger = getGlobal("diag");
					if (!logger) return;
					return logger[funcName](...args);
				};
			}
			const self = this;
			const setLogger = (logger, optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }) => {
				var _a, _b, _c;
				if (logger === self) {
					const err = /* @__PURE__ */ new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
					self.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
					return false;
				}
				if (typeof optionsOrLogLevel === "number") optionsOrLogLevel = { logLevel: optionsOrLogLevel };
				const oldLogger = getGlobal("diag");
				const newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger);
				if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
					const stack = (_c = (/* @__PURE__ */ new Error()).stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
					oldLogger.warn(`Current logger will be overwritten from ${stack}`);
					newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
				}
				return registerGlobal("diag", newLogger, self, true);
			};
			self.setLogger = setLogger;
			self.disable = () => {
				unregisterGlobal(API_NAME$3, self);
			};
			self.createComponentLogger = (options) => {
				return new DiagComponentLogger(options);
			};
			self.verbose = _logProxy("verbose");
			self.debug = _logProxy("debug");
			self.info = _logProxy("info");
			self.warn = _logProxy("warn");
			self.error = _logProxy("error");
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/baggage/internal/baggage-impl.js
	var BaggageImpl = class BaggageImpl {
		constructor(entries) {
			this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
		}
		getEntry(key) {
			const entry = this._entries.get(key);
			if (!entry) return;
			return Object.assign({}, entry);
		}
		getAllEntries() {
			return Array.from(this._entries.entries());
		}
		setEntry(key, entry) {
			const newBaggage = new BaggageImpl(this._entries);
			newBaggage._entries.set(key, entry);
			return newBaggage;
		}
		removeEntry(key) {
			const newBaggage = new BaggageImpl(this._entries);
			newBaggage._entries.delete(key);
			return newBaggage;
		}
		removeEntries(...keys) {
			const newBaggage = new BaggageImpl(this._entries);
			for (const key of keys) newBaggage._entries.delete(key);
			return newBaggage;
		}
		clear() {
			return new BaggageImpl();
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/baggage/internal/symbol.js
	/**
	* Symbol used to make BaggageEntryMetadata an opaque type
	*/
	var baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/baggage/utils.js
	var diag$1 = DiagAPI.instance();
	/**
	* Create a new Baggage with optional entries
	*
	* @param entries An array of baggage entries the new baggage should contain
	*/
	function createBaggage(entries = {}) {
		return new BaggageImpl(new Map(Object.entries(entries)));
	}
	/**
	* Create a serializable BaggageEntryMetadata object from a string.
	*
	* @param str string metadata. Format is currently not defined by the spec and has no special meaning.
	*
	* @since 1.0.0
	*/
	function baggageEntryMetadataFromString(str) {
		if (typeof str !== "string") {
			diag$1.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
			str = "";
		}
		return {
			__TYPE__: baggageEntryMetadataSymbol,
			toString() {
				return str;
			}
		};
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/context/context.js
	/**
	* Get a key to uniquely identify a context value
	*
	* @since 1.0.0
	*/
	function createContextKey(description) {
		return Symbol.for(description);
	}
	/**
	* The root context is used as the default parent context when there is no active context
	*
	* @since 1.0.0
	*/
	var ROOT_CONTEXT = new class BaseContext {
		/**
		* Construct a new context which inherits values from an optional parent context.
		*
		* @param parentContext a context from which to inherit values
		*/
		constructor(parentContext) {
			const self = this;
			self._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
			self.getValue = (key) => self._currentContext.get(key);
			self.setValue = (key, value) => {
				const context = new BaseContext(self._currentContext);
				context._currentContext.set(key, value);
				return context;
			};
			self.deleteValue = (key) => {
				const context = new BaseContext(self._currentContext);
				context._currentContext.delete(key);
				return context;
			};
		}
	}();
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/metrics/NoopMeter.js
	/**
	* NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
	* constant NoopMetrics for all of its methods.
	*/
	var NoopMeter = class {
		constructor() {}
		/**
		* @see {@link Meter.createGauge}
		*/
		createGauge(_name, _options) {
			return NOOP_GAUGE_METRIC;
		}
		/**
		* @see {@link Meter.createHistogram}
		*/
		createHistogram(_name, _options) {
			return NOOP_HISTOGRAM_METRIC;
		}
		/**
		* @see {@link Meter.createCounter}
		*/
		createCounter(_name, _options) {
			return NOOP_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.createUpDownCounter}
		*/
		createUpDownCounter(_name, _options) {
			return NOOP_UP_DOWN_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.createObservableGauge}
		*/
		createObservableGauge(_name, _options) {
			return NOOP_OBSERVABLE_GAUGE_METRIC;
		}
		/**
		* @see {@link Meter.createObservableCounter}
		*/
		createObservableCounter(_name, _options) {
			return NOOP_OBSERVABLE_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.createObservableUpDownCounter}
		*/
		createObservableUpDownCounter(_name, _options) {
			return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.addBatchObservableCallback}
		*/
		addBatchObservableCallback(_callback, _observables) {}
		/**
		* @see {@link Meter.removeBatchObservableCallback}
		*/
		removeBatchObservableCallback(_callback) {}
	};
	var NoopMetric = class {};
	var NoopCounterMetric = class extends NoopMetric {
		add(_value, _attributes) {}
	};
	var NoopUpDownCounterMetric = class extends NoopMetric {
		add(_value, _attributes) {}
	};
	var NoopGaugeMetric = class extends NoopMetric {
		record(_value, _attributes) {}
	};
	var NoopHistogramMetric = class extends NoopMetric {
		record(_value, _attributes) {}
	};
	var NoopObservableMetric = class {
		addCallback(_callback) {}
		removeCallback(_callback) {}
	};
	var NoopObservableCounterMetric = class extends NoopObservableMetric {};
	var NoopObservableGaugeMetric = class extends NoopObservableMetric {};
	var NoopObservableUpDownCounterMetric = class extends NoopObservableMetric {};
	var NOOP_METER = new NoopMeter();
	var NOOP_COUNTER_METRIC = new NoopCounterMetric();
	var NOOP_GAUGE_METRIC = new NoopGaugeMetric();
	var NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
	var NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
	var NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
	var NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
	var NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
	/**
	* Create a no-op Meter
	*
	* @since 1.3.0
	*/
	function createNoopMeter() {
		return NOOP_METER;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/propagation/TextMapPropagator.js
	/**
	* @since 1.0.0
	*/
	var defaultTextMapGetter = {
		get(carrier, key) {
			if (carrier == null) return;
			return carrier[key];
		},
		keys(carrier) {
			if (carrier == null) return [];
			return Object.keys(carrier);
		}
	};
	/**
	* @since 1.0.0
	*/
	var defaultTextMapSetter = { set(carrier, key, value) {
		if (carrier == null) return;
		carrier[key] = value;
	} };
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
	var NoopContextManager = class {
		active() {
			return ROOT_CONTEXT;
		}
		with(_context, fn, thisArg, ...args) {
			return fn.call(thisArg, ...args);
		}
		bind(_context, target) {
			return target;
		}
		enable() {
			return this;
		}
		disable() {
			return this;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/api/context.js
	var API_NAME$2 = "context";
	var NOOP_CONTEXT_MANAGER = new NoopContextManager();
	/**
	* Singleton object which represents the entry point to the OpenTelemetry Context API
	*
	* @since 1.0.0
	*/
	var ContextAPI = class ContextAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {}
		/** Get the singleton instance of the Context API */
		static getInstance() {
			if (!this._instance) this._instance = new ContextAPI();
			return this._instance;
		}
		/**
		* Set the current context manager.
		*
		* @returns true if the context manager was successfully registered, else false
		*/
		setGlobalContextManager(contextManager) {
			return registerGlobal(API_NAME$2, contextManager, DiagAPI.instance());
		}
		/**
		* Get the currently active context
		*/
		active() {
			return this._getContextManager().active();
		}
		/**
		* Execute a function with an active context
		*
		* @param context context to be active during function execution
		* @param fn function to execute in a context
		* @param thisArg optional receiver to be used for calling fn
		* @param args optional arguments forwarded to fn
		*/
		with(context, fn, thisArg, ...args) {
			return this._getContextManager().with(context, fn, thisArg, ...args);
		}
		/**
		* Bind a context to a target function or event emitter
		*
		* @param context context to bind to the event emitter or function. Defaults to the currently active context
		* @param target function or event emitter to bind
		*/
		bind(context, target) {
			return this._getContextManager().bind(context, target);
		}
		_getContextManager() {
			return getGlobal(API_NAME$2) || NOOP_CONTEXT_MANAGER;
		}
		/** Disable and remove the global context manager */
		disable() {
			this._getContextManager().disable();
			unregisterGlobal(API_NAME$2, DiagAPI.instance());
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
	/**
	* @since 1.0.0
	*/
	var TraceFlags;
	(function(TraceFlags) {
		/** Represents no flag set. */
		TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
		/** Bit to represent whether trace is sampled in trace flags. */
		TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
	})(TraceFlags || (TraceFlags = {}));
	/**
	* @since 1.0.0
	*/
	var INVALID_SPAN_CONTEXT = {
		traceId: "00000000000000000000000000000000",
		spanId: "0000000000000000",
		traceFlags: TraceFlags.NONE
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
	/**
	* The NonRecordingSpan is the default {@link Span} that is used when no Span
	* implementation is available. All operations are no-op including context
	* propagation.
	*/
	var NonRecordingSpan = class {
		constructor(spanContext = INVALID_SPAN_CONTEXT) {
			this._spanContext = spanContext;
		}
		spanContext() {
			return this._spanContext;
		}
		setAttribute(_key, _value) {
			return this;
		}
		setAttributes(_attributes) {
			return this;
		}
		addEvent(_name, _attributes) {
			return this;
		}
		addLink(_link) {
			return this;
		}
		addLinks(_links) {
			return this;
		}
		setStatus(_status) {
			return this;
		}
		updateName(_name) {
			return this;
		}
		end(_endTime) {}
		isRecording() {
			return false;
		}
		recordException(_exception, _time) {}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
	/**
	* span key
	*/
	var SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
	/**
	* Return the span if one exists
	*
	* @param context context to get span from
	*/
	function getSpan(context) {
		return context.getValue(SPAN_KEY) || void 0;
	}
	/**
	* Gets the span from the current context, if one exists.
	*/
	function getActiveSpan() {
		return getSpan(ContextAPI.getInstance().active());
	}
	/**
	* Set the span on a context
	*
	* @param context context to use as parent
	* @param span span to set active
	*/
	function setSpan(context, span) {
		return context.setValue(SPAN_KEY, span);
	}
	/**
	* Remove current span stored in the context
	*
	* @param context context to delete span from
	*/
	function deleteSpan(context) {
		return context.deleteValue(SPAN_KEY);
	}
	/**
	* Wrap span context in a NoopSpan and set as span in a new
	* context
	*
	* @param context context to set active span on
	* @param spanContext span context to be wrapped
	*/
	function setSpanContext(context, spanContext) {
		return setSpan(context, new NonRecordingSpan(spanContext));
	}
	/**
	* Get the span context of the span if it exists.
	*
	* @param context context to get values from
	*/
	function getSpanContext(context) {
		var _a;
		return (_a = getSpan(context)) === null || _a === void 0 ? void 0 : _a.spanContext();
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
	var isHex = new Uint8Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1
	]);
	function isValidHex(id, length) {
		if (typeof id !== "string" || id.length !== length) return false;
		let r = 0;
		for (let i = 0; i < id.length; i += 4) r += (isHex[id.charCodeAt(i)] | 0) + (isHex[id.charCodeAt(i + 1)] | 0) + (isHex[id.charCodeAt(i + 2)] | 0) + (isHex[id.charCodeAt(i + 3)] | 0);
		return r === length;
	}
	/**
	* @since 1.0.0
	*/
	function isValidTraceId(traceId) {
		return isValidHex(traceId, 32) && traceId !== "00000000000000000000000000000000";
	}
	/**
	* @since 1.0.0
	*/
	function isValidSpanId(spanId) {
		return isValidHex(spanId, 16) && spanId !== "0000000000000000";
	}
	/**
	* Returns true if this {@link SpanContext} is valid.
	* @return true if this {@link SpanContext} is valid.
	*
	* @since 1.0.0
	*/
	function isSpanContextValid(spanContext) {
		return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
	}
	/**
	* Wrap the given {@link SpanContext} in a new non-recording {@link Span}
	*
	* @param spanContext span context to be wrapped
	* @returns a new non-recording {@link Span} with the provided context
	*/
	function wrapSpanContext(spanContext) {
		return new NonRecordingSpan(spanContext);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
	var contextApi = ContextAPI.getInstance();
	/**
	* No-op implementations of {@link Tracer}.
	*/
	var NoopTracer = class {
		startSpan(name, options, context = contextApi.active()) {
			if (Boolean(options === null || options === void 0 ? void 0 : options.root)) return new NonRecordingSpan();
			const parentFromContext = context && getSpanContext(context);
			if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) return new NonRecordingSpan(parentFromContext);
			else return new NonRecordingSpan();
		}
		startActiveSpan(name, arg2, arg3, arg4) {
			let opts;
			let ctx;
			let fn;
			if (arguments.length < 2) return;
			else if (arguments.length === 2) fn = arg2;
			else if (arguments.length === 3) {
				opts = arg2;
				fn = arg3;
			} else {
				opts = arg2;
				ctx = arg3;
				fn = arg4;
			}
			const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
			const span = this.startSpan(name, opts, parentContext);
			const contextWithSpanSet = setSpan(parentContext, span);
			return contextApi.with(contextWithSpanSet, fn, void 0, span);
		}
	};
	function isSpanContext(spanContext) {
		return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
	var NOOP_TRACER = new NoopTracer();
	/**
	* Proxy tracer provided by the proxy tracer provider
	*
	* @since 1.0.0
	*/
	var ProxyTracer = class {
		constructor(provider, name, version, options) {
			this._provider = provider;
			this.name = name;
			this.version = version;
			this.options = options;
		}
		startSpan(name, options, context) {
			return this._getTracer().startSpan(name, options, context);
		}
		startActiveSpan(_name, _options, _context, _fn) {
			const tracer = this._getTracer();
			return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
		}
		/**
		* Try to get a tracer from the proxy tracer provider.
		* If the proxy tracer provider has no delegate, return a noop tracer.
		*/
		_getTracer() {
			if (this._delegate) return this._delegate;
			const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
			if (!tracer) return NOOP_TRACER;
			this._delegate = tracer;
			return this._delegate;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
	/**
	* An implementation of the {@link TracerProvider} which returns an impotent
	* Tracer for all calls to `getTracer`.
	*
	* All operations are no-op.
	*/
	var NoopTracerProvider = class {
		getTracer(_name, _version, _options) {
			return new NoopTracer();
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
	var NOOP_TRACER_PROVIDER = new NoopTracerProvider();
	/**
	* Tracer provider which provides {@link ProxyTracer}s.
	*
	* Before a delegate is set, tracers provided are NoOp.
	*   When a delegate is set, traces are provided from the delegate.
	*   When a delegate is set after tracers have already been provided,
	*   all tracers already provided will use the provided delegate implementation.
	*
	* @deprecated This will be removed in the next major version.
	* @since 1.0.0
	*/
	var ProxyTracerProvider = class {
		/**
		* Get a {@link ProxyTracer}
		*/
		getTracer(name, version, options) {
			var _a;
			return (_a = this.getDelegateTracer(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyTracer(this, name, version, options);
		}
		getDelegate() {
			var _a;
			return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
		}
		/**
		* Set the delegate tracer provider
		*/
		setDelegate(delegate) {
			this._delegate = delegate;
		}
		getDelegateTracer(name, version, options) {
			var _a;
			return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version, options);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js
	/**
	* @deprecated use the one declared in @opentelemetry/sdk-trace-base instead.
	* A sampling decision that determines how a {@link Span} will be recorded
	* and collected.
	*
	* @since 1.0.0
	*/
	var SamplingDecision$1;
	(function(SamplingDecision) {
		/**
		* `Span.isRecording() === false`, span will not be recorded and all events
		* and attributes will be dropped.
		*/
		SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
		/**
		* `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
		* MUST NOT be set.
		*/
		SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
		/**
		* `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
		* MUST be set.
		*/
		SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
	})(SamplingDecision$1 || (SamplingDecision$1 = {}));
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/span_kind.js
	/**
	* @since 1.0.0
	*/
	var SpanKind;
	(function(SpanKind) {
		/** Default value. Indicates that the span is used internally. */
		SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
		/**
		* Indicates that the span covers server-side handling of an RPC or other
		* remote request.
		*/
		SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
		/**
		* Indicates that the span covers the client-side wrapper around an RPC or
		* other remote request.
		*/
		SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
		/**
		* Indicates that the span describes producer sending a message to a
		* broker. Unlike client and server, there is no direct critical path latency
		* relationship between producer and consumer spans.
		*/
		SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
		/**
		* Indicates that the span describes consumer receiving a message from a
		* broker. Unlike client and server, there is no direct critical path latency
		* relationship between producer and consumer spans.
		*/
		SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
	})(SpanKind || (SpanKind = {}));
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace/status.js
	/**
	* An enumeration of status codes.
	*
	* @since 1.0.0
	*/
	var SpanStatusCode;
	(function(SpanStatusCode) {
		/**
		* The default status.
		*/
		SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
		/**
		* The operation has been validated by an Application developer or
		* Operator to have completed successfully.
		*/
		SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
		/**
		* The operation contains an error.
		*/
		SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
	})(SpanStatusCode || (SpanStatusCode = {}));
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/context-api.js
	/**
	* Entrypoint for context API
	* @since 1.0.0
	*/
	var context = ContextAPI.getInstance();
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/diag-api.js
	/**
	* Entrypoint for Diag API.
	* Defines Diagnostic handler used for internal diagnostic logging operations.
	* The default provides a Noop DiagLogger implementation which may be changed via the
	* diag.setLogger(logger: DiagLogger) function.
	*
	* @since 1.0.0
	*/
	var diag = DiagAPI.instance();
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/propagation/NoopTextMapPropagator.js
	/**
	* No-op implementations of {@link TextMapPropagator}.
	*/
	var NoopTextMapPropagator = class {
		/** Noop inject function does nothing */
		inject(_context, _carrier) {}
		/** Noop extract function does nothing and returns the input context */
		extract(context, _carrier) {
			return context;
		}
		fields() {
			return [];
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/baggage/context-helpers.js
	/**
	* Baggage key
	*/
	var BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
	/**
	* Retrieve the current baggage from the given context
	*
	* @param {Context} Context that manage all context values
	* @returns {Baggage} Extracted baggage from the context
	*/
	function getBaggage(context) {
		return context.getValue(BAGGAGE_KEY) || void 0;
	}
	/**
	* Retrieve the current baggage from the active/current context
	*
	* @returns {Baggage} Extracted baggage from the context
	*/
	function getActiveBaggage() {
		return getBaggage(ContextAPI.getInstance().active());
	}
	/**
	* Store a baggage in the given context
	*
	* @param {Context} Context that manage all context values
	* @param {Baggage} baggage that will be set in the actual context
	*/
	function setBaggage(context, baggage) {
		return context.setValue(BAGGAGE_KEY, baggage);
	}
	/**
	* Delete the baggage stored in the given context
	*
	* @param {Context} Context that manage all context values
	*/
	function deleteBaggage(context) {
		return context.deleteValue(BAGGAGE_KEY);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/api/propagation.js
	var API_NAME$1 = "propagation";
	var NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/propagation-api.js
	/**
	* Entrypoint for propagation API
	*
	* @since 1.0.0
	*/
	var propagation = class PropagationAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {
			this.createBaggage = createBaggage;
			this.getBaggage = getBaggage;
			this.getActiveBaggage = getActiveBaggage;
			this.setBaggage = setBaggage;
			this.deleteBaggage = deleteBaggage;
		}
		/** Get the singleton instance of the Propagator API */
		static getInstance() {
			if (!this._instance) this._instance = new PropagationAPI();
			return this._instance;
		}
		/**
		* Set the current propagator.
		*
		* @returns true if the propagator was successfully registered, else false
		*/
		setGlobalPropagator(propagator) {
			return registerGlobal(API_NAME$1, propagator, DiagAPI.instance());
		}
		/**
		* Inject context into a carrier to be propagated inter-process
		*
		* @param context Context carrying tracing data to inject
		* @param carrier carrier to inject context into
		* @param setter Function used to set values on the carrier
		*/
		inject(context, carrier, setter = defaultTextMapSetter) {
			return this._getGlobalPropagator().inject(context, carrier, setter);
		}
		/**
		* Extract context from a carrier
		*
		* @param context Context which the newly created context will inherit from
		* @param carrier Carrier to extract context from
		* @param getter Function used to extract keys from a carrier
		*/
		extract(context, carrier, getter = defaultTextMapGetter) {
			return this._getGlobalPropagator().extract(context, carrier, getter);
		}
		/**
		* Return a list of all fields which may be used by the propagator.
		*/
		fields() {
			return this._getGlobalPropagator().fields();
		}
		/** Remove the global propagator */
		disable() {
			unregisterGlobal(API_NAME$1, DiagAPI.instance());
		}
		_getGlobalPropagator() {
			return getGlobal(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
		}
	}.getInstance();
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/api/trace.js
	var API_NAME = "trace";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/api/build/esm/trace-api.js
	/**
	* Entrypoint for trace API
	*
	* @since 1.0.0
	*/
	var trace = class TraceAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {
			this._proxyTracerProvider = new ProxyTracerProvider();
			this.wrapSpanContext = wrapSpanContext;
			this.isSpanContextValid = isSpanContextValid;
			this.deleteSpan = deleteSpan;
			this.getSpan = getSpan;
			this.getActiveSpan = getActiveSpan;
			this.getSpanContext = getSpanContext;
			this.setSpan = setSpan;
			this.setSpanContext = setSpanContext;
		}
		/** Get the singleton instance of the Trace API */
		static getInstance() {
			if (!this._instance) this._instance = new TraceAPI();
			return this._instance;
		}
		/**
		* Set the current global tracer.
		*
		* @returns true if the tracer provider was successfully registered, else false
		*/
		setGlobalTracerProvider(provider) {
			const success = registerGlobal(API_NAME, this._proxyTracerProvider, DiagAPI.instance());
			if (success) this._proxyTracerProvider.setDelegate(provider);
			return success;
		}
		/**
		* Returns the global tracer provider.
		*/
		getTracerProvider() {
			return getGlobal(API_NAME) || this._proxyTracerProvider;
		}
		/**
		* Returns a tracer from the global tracer provider.
		*/
		getTracer(name, version) {
			return this.getTracerProvider().getTracer(name, version);
		}
		/** Remove the global tracer provider */
		disable() {
			unregisterGlobal(API_NAME, DiagAPI.instance());
			this._proxyTracerProvider = new ProxyTracerProvider();
		}
	}.getInstance();
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
	var SUPPRESS_TRACING_KEY$2 = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
	function isTracingSuppressed$1(context) {
		return context.getValue(SUPPRESS_TRACING_KEY$2) === true;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/baggage/constants.js
	var BAGGAGE_HEADER = "baggage";
	var BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/baggage/utils.js
	function serializeKeyPairs(keyPairs) {
		return keyPairs.reduce((hValue, current) => {
			const value = `${hValue}${hValue !== "" ? "," : ""}${current}`;
			return value.length > 8192 ? hValue : value;
		}, "");
	}
	function getKeyPairs(baggage) {
		return baggage.getAllEntries().map(([key, value]) => {
			let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
			if (value.metadata !== void 0) entry += ";" + value.metadata.toString();
			return entry;
		});
	}
	function parsePairKeyValue(entry) {
		if (!entry) return;
		const metadataSeparatorIndex = entry.indexOf(";");
		const keyPairPart = metadataSeparatorIndex === -1 ? entry : entry.substring(0, metadataSeparatorIndex);
		const separatorIndex = keyPairPart.indexOf("=");
		if (separatorIndex <= 0) return;
		const rawKey = keyPairPart.substring(0, separatorIndex).trim();
		const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
		if (!rawKey || !rawValue) return;
		let key;
		let value;
		try {
			key = decodeURIComponent(rawKey);
			value = decodeURIComponent(rawValue);
		} catch {
			return;
		}
		let metadata;
		if (metadataSeparatorIndex !== -1 && metadataSeparatorIndex < entry.length - 1) metadata = baggageEntryMetadataFromString(entry.substring(metadataSeparatorIndex + 1));
		return {
			key,
			value,
			metadata
		};
	}
	/**
	* Parses a single baggage header string into the provided record, applying limits defined in this package.
	* Uses indexOf/substring in a while loop to avoid allocating a full array of split entries.
	* Returns the updated pair count so callers can track totals across multiple header values.
	*/
	function parseBaggageHeaderString(value, baggage, count, totalSize) {
		let start = 0;
		while (start < value.length && count < 180) {
			const end = value.indexOf(",", start);
			const entryEnd = end === -1 ? value.length : end;
			const entryLength = entryEnd - start;
			if (entryLength <= 4096) {
				const keyPair = parsePairKeyValue(value.substring(start, entryEnd));
				if (keyPair) {
					const entrySize = (count === 0 ? 0 : 1) + entryLength;
					if (totalSize + entrySize > 8192) break;
					baggage[keyPair.key] = keyPair.metadata ? {
						value: keyPair.value,
						metadata: keyPair.metadata
					} : { value: keyPair.value };
					count++;
					totalSize += entrySize;
				}
			}
			if (end === -1) break;
			start = end + 1;
		}
		return [count, totalSize];
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/baggage/propagation/W3CBaggagePropagator.js
	/**
	* Propagates {@link Baggage} through Context format propagation.
	*
	* Based on the Baggage specification:
	* https://w3c.github.io/baggage/
	*/
	var W3CBaggagePropagator = class {
		inject(context, carrier, setter) {
			const baggage = propagation.getBaggage(context);
			if (!baggage || isTracingSuppressed$1(context)) return;
			const headerValue = serializeKeyPairs(getKeyPairs(baggage).filter((pair) => {
				return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
			}).slice(0, 180));
			if (headerValue.length > 0) setter.set(carrier, BAGGAGE_HEADER, headerValue);
		}
		extract(context, carrier, getter) {
			const headerValue = getter.get(carrier, BAGGAGE_HEADER);
			if (!headerValue) return context;
			const baggage = {};
			let count = 0;
			let totalSize = 0;
			if (Array.isArray(headerValue)) for (let i = 0; i < headerValue.length; i++) [count, totalSize] = parseBaggageHeaderString(headerValue[i], baggage, count, totalSize);
			else [count] = parseBaggageHeaderString(headerValue, baggage, count, totalSize);
			if (count === 0) return context;
			return propagation.setBaggage(context, propagation.createBaggage(baggage));
		}
		fields() {
			return [BAGGAGE_HEADER];
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/semantic-conventions/build/esm/stable_attributes.js
	/**
	* The exception message.
	*
	* @example Division by zero
	* @example Can't convert 'int' object to str implicitly
	*
	* @note > [!WARNING]
	*
	* > This attribute may contain sensitive information.
	*/
	var ATTR_EXCEPTION_MESSAGE = "exception.message";
	/**
	* A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
	*
	* @example "Exception in thread "main" java.lang.RuntimeException: Test exception\\n at com.example.GenerateTrace.methodB(GenerateTrace.java:13)\\n at com.example.GenerateTrace.methodA(GenerateTrace.java:9)\\n at com.example.GenerateTrace.main(GenerateTrace.java:5)\\n"
	*/
	var ATTR_EXCEPTION_STACKTRACE = "exception.stacktrace";
	/**
	* The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
	*
	* @example java.net.ConnectException
	* @example OSError
	*
	* @note If the recorded exception type is a wrapper that is not meaningful for
	* failure classification, instrumentation **MAY** use the type of the inner
	* exception instead. For example, in Go, errors created with `fmt.Errorf`
	* using `%w` **MAY** be unwrapped when the wrapper type does not help
	* classify the failure.
	*/
	var ATTR_EXCEPTION_TYPE = "exception.type";
	/**
	* Logical name of the service.
	*
	* @example shoppingcart
	*
	* @note **MUST** be the same for all instances of horizontally scaled services. If the value was not specified, SDKs **MUST** fallback to `unknown_service:` concatenated with the process executable name, e.g. `unknown_service:bash`. If the process executable name is not available, the value **MUST** be set to `unknown_service`.
	* The process executable name is the name of the process executable, the same value as described by the [`process.executable.name`](process.md) resource attribute.
	*/
	var ATTR_SERVICE_NAME = "service.name";
	/**
	* The language of the telemetry SDK.
	*/
	var ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
	/**
	* Enum value "webjs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	var TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
	/**
	* The name of the telemetry SDK as defined above.
	*
	* @example opentelemetry
	*
	* @note The OpenTelemetry SDK **MUST** set the `telemetry.sdk.name` attribute to `opentelemetry`.
	* If another SDK, like a fork or a vendor-provided implementation, is used, this SDK **MUST** set the
	* `telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK's main entry point
	* or another suitable identifier depending on the language.
	* The identifier `opentelemetry` is reserved and **MUST NOT** be used in this case.
	* All custom identifiers **SHOULD** be stable across different versions of an implementation.
	*/
	var ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
	/**
	* The version string of the telemetry SDK.
	*
	* @example 1.2.3
	*/
	var ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/propagation/composite.js
	/** Combines multiple propagators into a single propagator. */
	var CompositePropagator = class {
		_propagators;
		_fields;
		/**
		* Construct a composite propagator from a list of propagators.
		*
		* @param [config] Configuration object for composite propagator
		*/
		constructor(config = {}) {
			this._propagators = config.propagators ?? [];
			const fields = /* @__PURE__ */ new Set();
			for (const propagator of this._propagators) {
				const propagatorFields = typeof propagator.fields === "function" ? propagator.fields() : [];
				for (const field of propagatorFields) fields.add(field);
			}
			this._fields = Array.from(fields);
		}
		/**
		* Run each of the configured propagators with the given context and carrier.
		* Propagators are run in the order they are configured, so if multiple
		* propagators write the same carrier key, the propagator later in the list
		* will "win".
		*
		* @param context Context to inject
		* @param carrier Carrier into which context will be injected
		*/
		inject(context, carrier, setter) {
			for (const propagator of this._propagators) try {
				propagator.inject(context, carrier, setter);
			} catch (err) {
				diag.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
			}
		}
		/**
		* Run each of the configured propagators with the given context and carrier.
		* Propagators are run in the order they are configured, so if multiple
		* propagators write the same context key, the propagator later in the list
		* will "win".
		*
		* @param context Context to add values to
		* @param carrier Carrier from which to extract context
		*/
		extract(context, carrier, getter) {
			return this._propagators.reduce((ctx, propagator) => {
				try {
					return propagator.extract(ctx, carrier, getter);
				} catch (err) {
					diag.warn(`Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`);
				}
				return ctx;
			}, context);
		}
		fields() {
			return this._fields.slice();
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/internal/validators.js
	var VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
	var VALID_KEY_REGEX = new RegExp(`^(?:${`[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`}|${`[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`})$`);
	var VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
	var INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
	/**
	* Key is opaque string up to 256 characters printable. It MUST begin with a
	* lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
	* underscores _, dashes -, asterisks *, and forward slashes /.
	* For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
	* vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
	* see https://www.w3.org/TR/trace-context/#key
	*/
	function validateKey(key) {
		return VALID_KEY_REGEX.test(key);
	}
	/**
	* Value is opaque string up to 256 characters printable ASCII RFC0020
	* characters (i.e., the range 0x20 to 0x7E) except comma , and =.
	*/
	function validateValue(value) {
		return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/trace/TraceState.js
	var MAX_TRACE_STATE_ITEMS = 32;
	var MAX_TRACE_STATE_LEN = 512;
	var LIST_MEMBERS_SEPARATOR = ",";
	var LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
	/**
	* TraceState must be a class and not a simple object type because of the spec
	* requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
	*
	* Here is the list of allowed mutations:
	* - New key-value pair should be added into the beginning of the list
	* - The value of any key can be updated. Modified keys MUST be moved to the
	* beginning of the list.
	*/
	var TraceState = class TraceState {
		_length;
		_rawTraceState;
		_internalState;
		constructor(rawTraceState) {
			this._rawTraceState = typeof rawTraceState === "string" ? rawTraceState : "";
			this._length = this._rawTraceState.length;
		}
		set(key, value) {
			if (!validateKey(key) || !validateValue(value)) return this;
			const currState = this._getState();
			const currValue = currState.get(key);
			let newLength = this._length;
			if (typeof currValue === "string") newLength += value.length - currValue.length;
			else newLength += key.length + value.length + (currState.size > 0 ? 2 : 1);
			if (newLength > MAX_TRACE_STATE_LEN) return this;
			const newState = new Map(currState);
			newState.delete(key);
			newState.set(key, value);
			return this._fromState(newState, newLength);
		}
		unset(key) {
			const currState = this._getState();
			const currValue = currState.get(key);
			if (typeof currValue !== "string") return this;
			let newLength = this._length - (key.length + currValue.length + 1);
			if (currState.size > 1) newLength = newLength - 1;
			const newState = new Map(currState);
			newState.delete(key);
			return this._fromState(newState, newLength);
		}
		get(key) {
			return this._getState().get(key);
		}
		serialize() {
			let serialized = "";
			let index = 0;
			for (const entry of this._getState()) {
				if (index > 0) serialized = LIST_MEMBERS_SEPARATOR + serialized;
				serialized = `${entry[0]}${LIST_MEMBER_KEY_VALUE_SPLITTER}${entry[1]}` + serialized;
				index++;
			}
			return serialized;
		}
		_getState() {
			if (this._internalState) return this._internalState;
			const vendorMembers = this._rawTraceState.split(LIST_MEMBERS_SEPARATOR);
			const vendorEntries = /* @__PURE__ */ new Map();
			let currentLength = 0;
			for (const member of vendorMembers) {
				const m = member.trim();
				const idx = m.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
				if (idx === -1) continue;
				const key = m.slice(0, idx);
				const value = m.slice(idx + 1);
				if (!validateKey(key) || !validateValue(value)) continue;
				const futureLength = currentLength + m.length + (vendorEntries.size > 0 ? 1 : 0);
				if (futureLength > MAX_TRACE_STATE_LEN) continue;
				vendorEntries.set(key, value);
				currentLength = futureLength;
				if (vendorEntries.size >= MAX_TRACE_STATE_ITEMS) break;
			}
			this._length = currentLength;
			this._internalState = new Map(Array.from(vendorEntries.entries()).reverse());
			return this._internalState;
		}
		_fromState(state, length) {
			const traceState = Object.create(TraceState.prototype);
			traceState._internalState = state;
			traceState._length = length;
			return traceState;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/trace/W3CTraceContextPropagator.js
	var TRACE_PARENT_HEADER = "traceparent";
	var TRACE_STATE_HEADER = "tracestate";
	var VERSION$2 = "00";
	var TRACE_PARENT_REGEX = new RegExp(`^\\s?((?!ff)[\\da-f]{2})-((?![0]{32})[\\da-f]{32})-((?![0]{16})[\\da-f]{16})-([\\da-f]{2})(-.*)?\\s?$`);
	/**
	* Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
	* @param traceParent - A meta property that comes from server.
	*     It should be dynamically generated server side to have the server's request trace Id,
	*     a parent span Id that was set on the server's request span,
	*     and the trace flags to indicate the server's sampling decision
	*     (01 = sampled, 00 = not sampled).
	*     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
	*     For more information see {@link https://www.w3.org/TR/trace-context/}
	*/
	function parseTraceParent(traceParent) {
		const match = TRACE_PARENT_REGEX.exec(traceParent);
		if (!match) return null;
		if (match[1] === "00" && match[5]) return null;
		return {
			traceId: match[2],
			spanId: match[3],
			traceFlags: parseInt(match[4], 16)
		};
	}
	/**
	* Propagates {@link SpanContext} through Trace Context format propagation.
	*
	* Based on the Trace Context specification:
	* https://www.w3.org/TR/trace-context/
	*/
	var W3CTraceContextPropagator = class {
		inject(context, carrier, setter) {
			const spanContext = trace.getSpanContext(context);
			if (!spanContext || isTracingSuppressed$1(context) || !isSpanContextValid(spanContext)) return;
			const traceParent = `${VERSION$2}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;
			setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
			if (spanContext.traceState) setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
		}
		extract(context, carrier, getter) {
			const traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
			if (!traceParentHeader) return context;
			const traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
			if (typeof traceParent !== "string") return context;
			const spanContext = parseTraceParent(traceParent);
			if (!spanContext) return context;
			spanContext.isRemote = true;
			const traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
			if (traceStateHeader) {
				const state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
				spanContext.traceState = new TraceState(typeof state === "string" ? state : void 0);
			}
			return trace.setSpanContext(context, spanContext);
		}
		fields() {
			return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/utils/lodash.merge.js
	/**
	* based on lodash in order to support esm builds without esModuleInterop.
	* lodash is using MIT License.
	**/
	var objectTag = "[object Object]";
	var nullTag = "[object Null]";
	var undefinedTag = "[object Undefined]";
	var funcToString = Function.prototype.toString;
	var objectCtorString = funcToString.call(Object);
	var getPrototypeOf = Object.getPrototypeOf;
	var objectProto = Object.prototype;
	var hasOwnProperty = objectProto.hasOwnProperty;
	var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
	var nativeObjectToString = objectProto.toString;
	/**
	* Checks if `value` is a plain object, that is, an object created by the
	* `Object` constructor or one with a `[[Prototype]]` of `null`.
	*
	* @static
	* @memberOf _
	* @since 0.8.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	* }
	*
	* _.isPlainObject(new Foo);
	* // => false
	*
	* _.isPlainObject([1, 2, 3]);
	* // => false
	*
	* _.isPlainObject({ 'x': 0, 'y': 0 });
	* // => true
	*
	* _.isPlainObject(Object.create(null));
	* // => true
	*/
	function isPlainObject(value) {
		if (!isObjectLike(value) || baseGetTag(value) !== objectTag) return false;
		const proto = getPrototypeOf(value);
		if (proto === null) return true;
		const Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
		return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
	}
	/**
	* Checks if `value` is object-like. A value is object-like if it's not `null`
	* and has a `typeof` result of "object".
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	* @example
	*
	* _.isObjectLike({});
	* // => true
	*
	* _.isObjectLike([1, 2, 3]);
	* // => true
	*
	* _.isObjectLike(_.noop);
	* // => false
	*
	* _.isObjectLike(null);
	* // => false
	*/
	function isObjectLike(value) {
		return value != null && typeof value == "object";
	}
	/**
	* The base implementation of `getTag` without fallbacks for buggy environments.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	function baseGetTag(value) {
		if (value == null) return value === void 0 ? undefinedTag : nullTag;
		return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	/**
	* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the raw `toStringTag`.
	*/
	function getRawTag(value) {
		const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
		let unmasked = false;
		try {
			value[symToStringTag] = void 0;
			unmasked = true;
		} catch {}
		const result = nativeObjectToString.call(value);
		if (unmasked) {
			if (isOwn) value[symToStringTag] = tag;
			else delete value[symToStringTag];
		}
		return result;
	}
	/**
	* Converts `value` to a string using `Object.prototype.toString`.
	*
	* @private
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	*/
	function objectToString(value) {
		return nativeObjectToString.call(value);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/core/build/esm/utils/merge.js
	var MAX_LEVEL = 20;
	/**
	* Merges objects together
	* @param args - objects / values to be merged
	*/
	function merge(...args) {
		let result = args.shift();
		const objects = /* @__PURE__ */ new WeakMap();
		while (args.length > 0) result = mergeTwoObjects(result, args.shift(), 0, objects);
		return result;
	}
	function takeValue(value) {
		if (isArray(value)) return value.slice();
		return value;
	}
	/**
	* Merges two objects
	* @param one - first object
	* @param two - second object
	* @param level - current deep level
	* @param objects - objects holder that has been already referenced - to prevent
	* cyclic dependency
	*/
	function mergeTwoObjects(one, two, level = 0, objects) {
		let result;
		if (level > MAX_LEVEL) return;
		level++;
		if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) result = takeValue(two);
		else if (isArray(one)) {
			result = one.slice();
			if (isArray(two)) for (let i = 0, j = two.length; i < j; i++) result.push(takeValue(two[i]));
			else if (isObject(two)) {
				const keys = Object.keys(two);
				for (let i = 0, j = keys.length; i < j; i++) {
					const key = keys[i];
					if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
					result[key] = takeValue(two[key]);
				}
			}
		} else if (isObject(one)) {
			if (isObject(two)) {
				if (!shouldMerge(one, two)) return two;
				result = Object.assign({}, one);
				const keys = Object.keys(two);
				for (let i = 0, j = keys.length; i < j; i++) {
					const key = keys[i];
					if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
					const twoValue = two[key];
					if (isPrimitive(twoValue)) {
						if (typeof twoValue === "undefined") delete result[key];
						else result[key] = twoValue;
					} else {
						const obj1 = result[key];
						const obj2 = twoValue;
						if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) delete result[key];
						else {
							if (isObject(obj1) && isObject(obj2)) {
								const arr1 = objects.get(obj1) || [];
								const arr2 = objects.get(obj2) || [];
								arr1.push({
									obj: one,
									key
								});
								arr2.push({
									obj: two,
									key
								});
								objects.set(obj1, arr1);
								objects.set(obj2, arr2);
							}
							result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
						}
					}
				}
			} else result = two;
		}
		return result;
	}
	/**
	* Function to check if object has been already reference
	* @param obj
	* @param key
	* @param objects
	*/
	function wasObjectReferenced(obj, key, objects) {
		const arr = objects.get(obj[key]) || [];
		for (let i = 0, j = arr.length; i < j; i++) {
			const info = arr[i];
			if (info.key === key && info.obj === obj) return true;
		}
		return false;
	}
	function isArray(value) {
		return Array.isArray(value);
	}
	function isFunction(value) {
		return typeof value === "function";
	}
	function isObject(value) {
		return !isPrimitive(value) && !isArray(value) && !isFunction(value) && typeof value === "object";
	}
	function isPrimitive(value) {
		return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
	}
	function shouldMerge(one, two) {
		if (!isPlainObject(one) || !isPlainObject(two)) return false;
		return true;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/resources/node_modules/@opentelemetry/core/build/esm/version.js
	var VERSION$1 = "2.10.0";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/resources/node_modules/@opentelemetry/core/build/esm/semconv.js
	/**
	* The name of the runtime of this process.
	*
	* @example OpenJDK Runtime Environment
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	var ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/resources/node_modules/@opentelemetry/core/build/esm/platform/browser/sdk-info.js
	/** Constants describing the SDK in use */
	var SDK_INFO = {
		[ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
		[ATTR_PROCESS_RUNTIME_NAME]: "browser",
		[ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS,
		[ATTR_TELEMETRY_SDK_VERSION]: VERSION$1
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/resources/build/esm/default-service-name.js
	var serviceName;
	/**
	* Returns the default service name for OpenTelemetry resources.
	* In Node.js environments, returns "unknown_service:<process.argv0>".
	* In browser/edge environments, returns "unknown_service".
	*/
	function defaultServiceName() {
		if (serviceName === void 0) try {
			const argv0 = globalThis.process.argv0;
			serviceName = argv0 ? `unknown_service:${argv0}` : "unknown_service";
		} catch {
			serviceName = "unknown_service";
		}
		return serviceName;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/resources/build/esm/utils.js
	var isPromiseLike = (val) => {
		return val !== null && typeof val === "object" && typeof val.then === "function";
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/resources/build/esm/ResourceImpl.js
	var ResourceImpl = class ResourceImpl {
		_rawAttributes;
		_asyncAttributesPending = false;
		_schemaUrl;
		_memoizedAttributes;
		static FromAttributeList(attributes, options) {
			const res = new ResourceImpl({}, options);
			res._rawAttributes = guardedRawAttributes(attributes);
			res._asyncAttributesPending = attributes.filter(([_, val]) => isPromiseLike(val)).length > 0;
			return res;
		}
		constructor(resource, options) {
			const attributes = resource.attributes ?? {};
			this._rawAttributes = Object.entries(attributes).map(([k, v]) => {
				if (isPromiseLike(v)) this._asyncAttributesPending = true;
				return [k, v];
			});
			this._rawAttributes = guardedRawAttributes(this._rawAttributes);
			this._schemaUrl = validateSchemaUrl(options?.schemaUrl);
		}
		get asyncAttributesPending() {
			return this._asyncAttributesPending;
		}
		async waitForAsyncAttributes() {
			if (!this.asyncAttributesPending) return;
			for (let i = 0; i < this._rawAttributes.length; i++) {
				const [k, v] = this._rawAttributes[i];
				this._rawAttributes[i] = [k, isPromiseLike(v) ? await v : v];
			}
			this._asyncAttributesPending = false;
		}
		get attributes() {
			if (this.asyncAttributesPending) diag.error("Accessing resource attributes before async attributes settled");
			if (this._memoizedAttributes) return this._memoizedAttributes;
			const attrs = {};
			for (const [k, v] of this._rawAttributes) {
				if (isPromiseLike(v)) {
					diag.debug(`Unsettled resource attribute ${k} skipped`);
					continue;
				}
				if (v != null) attrs[k] ??= v;
			}
			if (!this._asyncAttributesPending) this._memoizedAttributes = attrs;
			return attrs;
		}
		getRawAttributes() {
			return this._rawAttributes;
		}
		get schemaUrl() {
			return this._schemaUrl;
		}
		merge(resource) {
			if (resource == null) return this;
			const mergedSchemaUrl = mergeSchemaUrl(this, resource);
			const mergedOptions = mergedSchemaUrl ? { schemaUrl: mergedSchemaUrl } : void 0;
			return ResourceImpl.FromAttributeList([...resource.getRawAttributes(), ...this.getRawAttributes()], mergedOptions);
		}
	};
	function resourceFromAttributes(attributes, options) {
		return ResourceImpl.FromAttributeList(Object.entries(attributes), options);
	}
	function defaultResource() {
		return resourceFromAttributes({
			[ATTR_SERVICE_NAME]: defaultServiceName(),
			[ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
			[ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
			[ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION]
		});
	}
	function guardedRawAttributes(attributes) {
		return attributes.map(([k, v]) => {
			if (isPromiseLike(v)) return [k, v.catch((err) => {
				diag.debug("promise rejection for resource attribute: %s - %s", k, err);
			})];
			return [k, v];
		});
	}
	function validateSchemaUrl(schemaUrl) {
		if (typeof schemaUrl === "string" || schemaUrl === void 0) return schemaUrl;
		diag.warn("Schema URL must be string or undefined, got %s. Schema URL will be ignored.", schemaUrl);
	}
	function mergeSchemaUrl(old, updating) {
		const oldSchemaUrl = old?.schemaUrl;
		const updatingSchemaUrl = updating?.schemaUrl;
		const isOldEmpty = oldSchemaUrl === void 0 || oldSchemaUrl === "";
		const isUpdatingEmpty = updatingSchemaUrl === void 0 || updatingSchemaUrl === "";
		if (isOldEmpty) return updatingSchemaUrl;
		if (isUpdatingEmpty) return oldSchemaUrl;
		if (oldSchemaUrl === updatingSchemaUrl) return oldSchemaUrl;
		diag.warn("Schema URL merge conflict: old resource has \"%s\", updating resource has \"%s\". Resulting resource will have undefined Schema URL.", oldSchemaUrl, updatingSchemaUrl);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
	var SUPPRESS_TRACING_KEY$1 = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
	function isTracingSuppressed(context) {
		return context.getValue(SUPPRESS_TRACING_KEY$1) === true;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/node_modules/@opentelemetry/core/build/esm/common/attributes.js
	function sanitizeAttributes(attributes) {
		const out = {};
		if (typeof attributes !== "object" || attributes == null) return out;
		for (const key in attributes) {
			if (!Object.prototype.hasOwnProperty.call(attributes, key)) continue;
			if (!isAttributeKey(key)) {
				diag.warn(`Invalid attribute key: ${key}`);
				continue;
			}
			const val = attributes[key];
			if (!isAttributeValue(val)) {
				diag.warn(`Invalid attribute value set for key: ${key}`);
				continue;
			}
			if (Array.isArray(val)) out[key] = val.slice();
			else out[key] = val;
		}
		return out;
	}
	function isAttributeKey(key) {
		return typeof key === "string" && key !== "";
	}
	function isAttributeValue(val) {
		if (val == null) return true;
		if (Array.isArray(val)) return isHomogeneousAttributeValueArray(val);
		return isValidPrimitiveAttributeValueType(typeof val);
	}
	function isHomogeneousAttributeValueArray(arr) {
		let type;
		for (const element of arr) {
			if (element == null) continue;
			const elementType = typeof element;
			if (elementType === type) continue;
			if (!type) {
				if (isValidPrimitiveAttributeValueType(elementType)) {
					type = elementType;
					continue;
				}
				return false;
			}
			return false;
		}
		return true;
	}
	function isValidPrimitiveAttributeValueType(valType) {
		switch (valType) {
			case "number":
			case "boolean":
			case "string": return true;
		}
		return false;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/node_modules/@opentelemetry/core/build/esm/common/logging-error-handler.js
	/**
	* Returns a function that logs an error using the provided logger, or a
	* console logger if one was not provided.
	*/
	function loggingErrorHandler$1() {
		return (ex) => {
			diag.error(stringifyException$1(ex));
		};
	}
	/**
	* Converts an exception into a string representation
	* @param {Exception} ex
	*/
	function stringifyException$1(ex) {
		if (typeof ex === "string") return ex;
		else return JSON.stringify(flattenException$1(ex));
	}
	/**
	* Flattens an exception into key-value pairs by traversing the prototype chain
	* and coercing values to strings. Duplicate properties will not be overwritten;
	* the first insert wins.
	*/
	function flattenException$1(ex) {
		const result = {};
		let current = ex;
		while (current !== null) {
			Object.getOwnPropertyNames(current).forEach((propertyName) => {
				if (result[propertyName]) return;
				const value = current[propertyName];
				if (value) result[propertyName] = String(value);
			});
			current = Object.getPrototypeOf(current);
		}
		return result;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js
	/** The global error handler delegate */
	var delegateHandler$1 = loggingErrorHandler$1();
	/**
	* Return the global error handler
	* @param {Exception} ex
	*/
	function globalErrorHandler$1(ex) {
		try {
			delegateHandler$1(ex);
		} catch {}
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/node_modules/@opentelemetry/core/build/esm/platform/browser/index.js
	/**
	* @deprecated Use performance directly.
	*/
	var otperformance = performance;
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/node_modules/@opentelemetry/core/build/esm/common/time.js
	var NANOSECOND_DIGITS$1 = 9;
	var MILLISECONDS_TO_NANOSECONDS = Math.pow(10, 6);
	var SECOND_TO_NANOSECONDS$1 = Math.pow(10, NANOSECOND_DIGITS$1);
	/**
	* Converts a number of milliseconds from epoch to HrTime([seconds, remainder in nanoseconds]).
	* @param epochMillis
	*/
	function millisToHrTime(epochMillis) {
		const epochSeconds = epochMillis / 1e3;
		return [Math.trunc(epochSeconds), Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS)];
	}
	/**
	* Returns an hrtime calculated via performance component.
	* @param performanceNow
	*/
	function hrTime(performanceNow) {
		return addHrTimes(millisToHrTime(otperformance.timeOrigin), millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now()));
	}
	/**
	* Returns a duration of two hrTime.
	* @param startTime
	* @param endTime
	*/
	function hrTimeDuration(startTime, endTime) {
		let seconds = endTime[0] - startTime[0];
		let nanos = endTime[1] - startTime[1];
		if (nanos < 0) {
			seconds -= 1;
			nanos += SECOND_TO_NANOSECONDS$1;
		}
		return [seconds, nanos];
	}
	/**
	* check if time is HrTime
	* @param value
	*/
	function isTimeInputHrTime(value) {
		return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
	}
	/**
	* check if input value is a correct types.TimeInput
	* @param value
	*/
	function isTimeInput(value) {
		return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
	}
	/**
	* Given 2 HrTime formatted times, return their sum as an HrTime.
	*/
	function addHrTimes(time1, time2) {
		const out = [time1[0] + time2[0], time1[1] + time2[1]];
		if (out[1] >= SECOND_TO_NANOSECONDS$1) {
			out[1] -= SECOND_TO_NANOSECONDS$1;
			out[0] += 1;
		}
		return out;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/enums.js
	var ExceptionEventName = "exception";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/inspect.js
	/**
	* Well-known symbol used by Node.js `util.inspect` (and `console.*`) to
	* render an object via a custom representation. Defined as a global Symbol
	* so it works without importing from `node:util`, keeping this module safe
	* for browser builds (where the symbol is simply never looked up).
	*/
	var inspectCustom = Symbol.for("nodejs.util.inspect.custom");
	/**
	* Collect a Resource's settled attributes without touching the
	* `attributes` getter, which emits diag.error/debug entries when async
	* attribute detectors are still pending. Promise-like (unsettled)
	* entries are silently skipped so logging a Span/Tracer/Provider during
	* startup doesn't recurse through the diag pipeline.
	*/
	function settledResourceAttributes(resource) {
		const attrs = {};
		for (const [k, v] of resource.getRawAttributes()) {
			if (typeof v?.then === "function") continue;
			if (v != null) attrs[k] ??= v;
		}
		return attrs;
	}
	/**
	* Build a class-tagged inspect representation. Returns a stub like
	* `[ClassName]` once the recursion budget is exhausted, otherwise returns
	* `ClassName <inspected payload>` so nested fields keep proper coloring,
	* indentation, and depth handling. In environments that don't supply an
	* `inspect` callback (e.g. browsers), falls back to returning the raw
	* payload object.
	*/
	function formatInspect(className, payload, depth, options, inspect) {
		if (typeof depth === "number" && depth < 0) {
			const tag = `[${className}]`;
			return options?.stylize ? options.stylize(tag, "special") : tag;
		}
		if (typeof inspect !== "function" || !options) return payload;
		return `${className} ${inspect(payload, {
			...options,
			depth: options.depth == null ? options.depth : options.depth - 1
		})}`;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/Span.js
	/**
	* This class represents a span.
	*/
	var SpanImpl = class {
		_spanContext;
		kind;
		parentSpanContext;
		attributes = {};
		links = [];
		events = [];
		startTime;
		resource;
		instrumentationScope;
		_droppedAttributesCount = 0;
		_droppedEventsCount = 0;
		_droppedLinksCount = 0;
		_attributesCount = 0;
		name;
		status = { code: SpanStatusCode.UNSET };
		endTime = [0, 0];
		_ended = false;
		_duration = [-1, -1];
		_spanProcessor;
		_spanLimits;
		_attributeValueLengthLimit;
		_recordEndMetrics;
		_performanceStartTime;
		_performanceOffset;
		_startTimeProvided;
		/**
		* Constructs a new SpanImpl instance.
		*/
		constructor(opts) {
			const now = Date.now();
			this._spanContext = opts.spanContext;
			this._performanceStartTime = otperformance.now();
			this._performanceOffset = now - (this._performanceStartTime + otperformance.timeOrigin);
			this._startTimeProvided = opts.startTime != null;
			this._spanLimits = opts.spanLimits;
			this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit ?? 0;
			this._spanProcessor = opts.spanProcessor;
			this.name = opts.name;
			this.parentSpanContext = opts.parentSpanContext;
			this.kind = opts.kind;
			if (opts.links) for (const link of opts.links) this.addLink(link);
			this.startTime = this._getTime(opts.startTime ?? now);
			this.resource = opts.resource;
			this.instrumentationScope = opts.scope;
			this._recordEndMetrics = opts.recordEndMetrics;
			if (opts.attributes != null) this.setAttributes(opts.attributes);
			this._spanProcessor.onStart(this, opts.context);
		}
		spanContext() {
			return this._spanContext;
		}
		setAttribute(key, value) {
			if (value == null || this._isSpanEnded()) return this;
			if (key.length === 0) {
				diag.warn(`Invalid attribute key: ${key}`);
				return this;
			}
			if (!isAttributeValue(value)) {
				diag.warn(`Invalid attribute value set for key: ${key}`);
				return this;
			}
			const { attributeCountLimit } = this._spanLimits;
			const isNewKey = !Object.prototype.hasOwnProperty.call(this.attributes, key);
			if (attributeCountLimit !== void 0 && this._attributesCount >= attributeCountLimit && isNewKey) {
				this._droppedAttributesCount++;
				return this;
			}
			this.attributes[key] = this._truncateToSize(value);
			if (isNewKey) this._attributesCount++;
			return this;
		}
		setAttributes(attributes) {
			for (const key in attributes) if (Object.prototype.hasOwnProperty.call(attributes, key)) this.setAttribute(key, attributes[key]);
			return this;
		}
		/**
		*
		* @param name Span Name
		* @param [attributesOrStartTime] Span attributes or start time
		*     if type is {@type TimeInput} and 3rd param is undefined
		* @param [timeStamp] Specified time stamp for the event
		*/
		addEvent(name, attributesOrStartTime, timeStamp) {
			if (this._isSpanEnded()) return this;
			const { eventCountLimit } = this._spanLimits;
			if (eventCountLimit === 0) {
				diag.warn("No events allowed.");
				this._droppedEventsCount++;
				return this;
			}
			if (eventCountLimit !== void 0 && this.events.length >= eventCountLimit) {
				if (this._droppedEventsCount === 0) diag.debug("Dropping extra events.");
				this.events.shift();
				this._droppedEventsCount++;
			}
			if (isTimeInput(attributesOrStartTime)) {
				if (!isTimeInput(timeStamp)) timeStamp = attributesOrStartTime;
				attributesOrStartTime = void 0;
			}
			const sanitized = sanitizeAttributes(attributesOrStartTime);
			const { attributePerEventCountLimit } = this._spanLimits;
			const attributes = {};
			let droppedAttributesCount = 0;
			let eventAttributesCount = 0;
			for (const attr in sanitized) {
				if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) continue;
				const attrVal = sanitized[attr];
				if (attributePerEventCountLimit !== void 0 && eventAttributesCount >= attributePerEventCountLimit) {
					droppedAttributesCount++;
					continue;
				}
				attributes[attr] = this._truncateToSize(attrVal);
				eventAttributesCount++;
			}
			this.events.push({
				name,
				attributes,
				time: this._getTime(timeStamp),
				droppedAttributesCount
			});
			return this;
		}
		addLink(link) {
			if (this._isSpanEnded()) return this;
			const { linkCountLimit } = this._spanLimits;
			if (linkCountLimit === 0) {
				this._droppedLinksCount++;
				return this;
			}
			if (linkCountLimit !== void 0 && this.links.length >= linkCountLimit) {
				if (this._droppedLinksCount === 0) diag.debug("Dropping extra links.");
				this.links.shift();
				this._droppedLinksCount++;
			}
			const { attributePerLinkCountLimit } = this._spanLimits;
			const sanitized = sanitizeAttributes(link.attributes);
			const attributes = {};
			let droppedAttributesCount = 0;
			let linkAttributesCount = 0;
			for (const attr in sanitized) {
				if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) continue;
				const attrVal = sanitized[attr];
				if (attributePerLinkCountLimit !== void 0 && linkAttributesCount >= attributePerLinkCountLimit) {
					droppedAttributesCount++;
					continue;
				}
				attributes[attr] = this._truncateToSize(attrVal);
				linkAttributesCount++;
			}
			const processedLink = { context: link.context };
			if (linkAttributesCount > 0) processedLink.attributes = attributes;
			if (droppedAttributesCount > 0) processedLink.droppedAttributesCount = droppedAttributesCount;
			this.links.push(processedLink);
			return this;
		}
		addLinks(links) {
			for (const link of links) this.addLink(link);
			return this;
		}
		setStatus(status) {
			if (this._isSpanEnded()) return this;
			if (status.code === SpanStatusCode.UNSET) return this;
			if (this.status.code === SpanStatusCode.OK) return this;
			const newStatus = { code: status.code };
			if (status.code === SpanStatusCode.ERROR) {
				if (typeof status.message === "string") newStatus.message = status.message;
				else if (status.message != null) diag.warn(`Dropping invalid status.message of type '${typeof status.message}', expected 'string'`);
			}
			this.status = newStatus;
			return this;
		}
		updateName(name) {
			if (this._isSpanEnded()) return this;
			this.name = name;
			return this;
		}
		end(endTime) {
			if (this._isSpanEnded()) {
				diag.error(`${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`);
				return;
			}
			this.endTime = this._getTime(endTime);
			this._duration = hrTimeDuration(this.startTime, this.endTime);
			if (this._duration[0] < 0) {
				diag.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime);
				this.endTime = this.startTime.slice();
				this._duration = [0, 0];
			}
			if (this._droppedEventsCount > 0) diag.warn(`Dropped ${this._droppedEventsCount} events because eventCountLimit reached`);
			if (this._droppedLinksCount > 0) diag.warn(`Dropped ${this._droppedLinksCount} links because linkCountLimit reached`);
			if (this._spanProcessor.onEnding) this._spanProcessor.onEnding(this);
			this._recordEndMetrics?.();
			this._ended = true;
			this._spanProcessor.onEnd(this);
		}
		_getTime(inp) {
			if (typeof inp === "number" && inp <= otperformance.now()) return hrTime(inp + this._performanceOffset);
			if (typeof inp === "number") return millisToHrTime(inp);
			if (inp instanceof Date) return millisToHrTime(inp.getTime());
			if (isTimeInputHrTime(inp)) return inp;
			if (this._startTimeProvided) return millisToHrTime(Date.now());
			const msDuration = otperformance.now() - this._performanceStartTime;
			return addHrTimes(this.startTime, millisToHrTime(msDuration));
		}
		isRecording() {
			return this._ended === false;
		}
		recordException(exception, time) {
			const attributes = {};
			if (typeof exception === "string") attributes[ATTR_EXCEPTION_MESSAGE] = exception;
			else if (exception) {
				if (exception.code) attributes[ATTR_EXCEPTION_TYPE] = exception.code.toString();
				else if (exception.name) attributes[ATTR_EXCEPTION_TYPE] = exception.name;
				if (exception.message) attributes[ATTR_EXCEPTION_MESSAGE] = exception.message;
				if (exception.stack) attributes[ATTR_EXCEPTION_STACKTRACE] = exception.stack;
			}
			if (attributes["exception.type"] || attributes["exception.message"]) this.addEvent(ExceptionEventName, attributes, time);
			else diag.warn(`Failed to record an exception ${exception}`);
		}
		get duration() {
			return this._duration;
		}
		get ended() {
			return this._ended;
		}
		get droppedAttributesCount() {
			return this._droppedAttributesCount;
		}
		get droppedEventsCount() {
			return this._droppedEventsCount;
		}
		get droppedLinksCount() {
			return this._droppedLinksCount;
		}
		_isSpanEnded() {
			if (this._ended) {
				const error = /* @__PURE__ */ new Error(`Operation attempted on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`);
				diag.warn(`Cannot execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`, error);
			}
			return this._ended;
		}
		_truncateToLimitUtil(value, limit) {
			if (value.length <= limit) return value;
			return value.substring(0, limit);
		}
		/**
		* If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
		* return string with truncated to {@code attributeValueLengthLimit} characters
		*
		* If the given attribute value is array of strings then
		* return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
		*
		* Otherwise return same Attribute {@code value}
		*
		* @param value Attribute value
		* @returns truncated attribute value if required, otherwise same value
		*/
		_truncateToSize(value) {
			const limit = this._attributeValueLengthLimit;
			if (limit <= 0) {
				diag.warn(`Attribute value limit must be positive, got ${limit}`);
				return value;
			}
			if (typeof value === "string") return this._truncateToLimitUtil(value, limit);
			if (Array.isArray(value)) return value.map((val) => typeof val === "string" ? this._truncateToLimitUtil(val, limit) : val);
			return value;
		}
		[inspectCustom](depth, options, inspect) {
			return formatInspect("SpanImpl", {
				name: this.name,
				kind: this.kind,
				spanContext: this._spanContext,
				parentSpanContext: this.parentSpanContext,
				status: this.status,
				startTime: this.startTime,
				endTime: this.endTime,
				duration: this._duration,
				ended: this._ended,
				attributes: this.attributes,
				events: this.events,
				links: this.links,
				droppedAttributesCount: this._droppedAttributesCount,
				droppedEventsCount: this._droppedEventsCount,
				droppedLinksCount: this._droppedLinksCount,
				instrumentationScope: this.instrumentationScope,
				resource: { attributes: settledResourceAttributes(this.resource) }
			}, depth, options, inspect);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/Sampler.js
	/**
	* A sampling decision that determines how a {@link Span} will be recorded
	* and collected.
	*/
	var SamplingDecision;
	(function(SamplingDecision) {
		/**
		* `Span.isRecording() === false`, span will not be recorded and all events
		* and attributes will be dropped.
		*/
		SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
		/**
		* `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
		* MUST NOT be set.
		*/
		SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
		/**
		* `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
		* MUST be set.
		*/
		SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
	})(SamplingDecision || (SamplingDecision = {}));
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/semconv.js
	/**
	* Determines whether the span has a parent span, and if so, [whether it is a remote parent](https://opentelemetry.io/docs/specs/otel/trace/api/#isremote)
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	var ATTR_OTEL_SPAN_PARENT_ORIGIN = "otel.span.parent.origin";
	/**
	* The result value of the sampler for this span
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	var ATTR_OTEL_SPAN_SAMPLING_RESULT = "otel.span.sampling_result";
	/**
	* The number of created spans with `recording=true` for which the end operation has not been called yet.
	*
	* @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	var METRIC_OTEL_SDK_SPAN_LIVE = "otel.sdk.span.live";
	/**
	* The number of created spans.
	*
	* @note Implementations **MUST** record this metric for all spans, even for non-recording ones.
	*
	* @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	var METRIC_OTEL_SDK_SPAN_STARTED = "otel.sdk.span.started";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/TracerMetrics.js
	/**
	* Generates `otel.sdk.span.*` metrics.
	* https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics/#span-metrics
	*/
	var TracerMetrics = class {
		startedSpans;
		liveSpans;
		constructor(meter) {
			this.startedSpans = meter.createCounter(METRIC_OTEL_SDK_SPAN_STARTED, {
				unit: "{span}",
				description: "The number of created spans."
			});
			this.liveSpans = meter.createUpDownCounter(METRIC_OTEL_SDK_SPAN_LIVE, {
				unit: "{span}",
				description: "The number of currently live spans."
			});
		}
		startSpan(parentSpanCtx, samplingDecision) {
			const samplingDecisionStr = samplingDecisionToString(samplingDecision);
			this.startedSpans.add(1, {
				[ATTR_OTEL_SPAN_PARENT_ORIGIN]: parentOrigin(parentSpanCtx),
				[ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
			});
			if (samplingDecision === SamplingDecision.NOT_RECORD) return () => {};
			const liveSpanAttributes = { [ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr };
			this.liveSpans.add(1, liveSpanAttributes);
			return () => {
				this.liveSpans.add(-1, liveSpanAttributes);
			};
		}
	};
	function parentOrigin(parentSpanContext) {
		if (!parentSpanContext) return "none";
		if (parentSpanContext.isRemote) return "remote";
		return "local";
	}
	function samplingDecisionToString(decision) {
		switch (decision) {
			case SamplingDecision.RECORD_AND_SAMPLED: return "RECORD_AND_SAMPLE";
			case SamplingDecision.RECORD: return "RECORD_ONLY";
			case SamplingDecision.NOT_RECORD: return "DROP";
		}
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/version.js
	var VERSION = "2.10.0";
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/Tracer.js
	/**
	* This class represents a basic tracer.
	*/
	var Tracer = class {
		_sampler;
		_spanLimits;
		_idGenerator;
		instrumentationScope;
		_resource;
		_spanProcessor;
		_tracerMetrics;
		/**
		* Constructs a new Tracer instance.
		*/
		constructor(instrumentationScope, options) {
			this.instrumentationScope = instrumentationScope;
			this._sampler = options.sampler;
			this._spanLimits = options.spanLimits;
			this._resource = options.resource;
			this._idGenerator = options.idGenerator;
			this._spanProcessor = options.spanProcessor;
			const meter = options.meterProvider.getMeter("@opentelemetry/sdk-trace", VERSION);
			this._tracerMetrics = new TracerMetrics(meter);
		}
		/**
		* Starts a new Span or returns the default NoopSpan based on the sampling
		* decision.
		*/
		startSpan(name, options = {}, context$1 = context.active()) {
			if (options.root) context$1 = trace.deleteSpan(context$1);
			const parentSpan = trace.getSpan(context$1);
			if (isTracingSuppressed(context$1)) {
				diag.debug("Instrumentation suppressed, returning Noop Span");
				return trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
			}
			const parentSpanContext = parentSpan?.spanContext();
			const spanId = this._idGenerator.generateSpanId();
			let validParentSpanContext;
			let traceId;
			let traceState;
			if (!parentSpanContext || !trace.isSpanContextValid(parentSpanContext)) traceId = this._idGenerator.generateTraceId();
			else {
				traceId = parentSpanContext.traceId;
				traceState = parentSpanContext.traceState;
				validParentSpanContext = parentSpanContext;
			}
			const spanKind = options.kind ?? SpanKind.INTERNAL;
			const links = (options.links ?? []).map((link) => {
				return {
					context: link.context,
					attributes: sanitizeAttributes(link.attributes)
				};
			});
			const attributes = sanitizeAttributes(options.attributes);
			const samplingResult = this._sampler.shouldSample(context$1, traceId, name, spanKind, attributes, links);
			const recordEndMetrics = this._tracerMetrics.startSpan(parentSpanContext, samplingResult.decision);
			traceState = samplingResult.traceState ?? traceState;
			const traceFlags = samplingResult.decision === SamplingDecision$1.RECORD_AND_SAMPLED ? TraceFlags.SAMPLED : TraceFlags.NONE;
			const spanContext = {
				traceId,
				spanId,
				traceFlags,
				traceState
			};
			if (samplingResult.decision === SamplingDecision$1.NOT_RECORD) {
				diag.debug("Recording is off, propagating context in a non-recording span");
				return trace.wrapSpanContext(spanContext);
			}
			const initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
			return new SpanImpl({
				resource: this._resource,
				scope: this.instrumentationScope,
				context: context$1,
				spanContext,
				name,
				kind: spanKind,
				links,
				parentSpanContext: validParentSpanContext,
				attributes: initAttributes,
				startTime: options.startTime,
				spanProcessor: this._spanProcessor,
				spanLimits: this._spanLimits,
				recordEndMetrics
			});
		}
		startActiveSpan(name, arg2, arg3, arg4) {
			let opts;
			let ctx;
			let fn;
			if (arguments.length < 2) return;
			else if (arguments.length === 2) fn = arg2;
			else if (arguments.length === 3) {
				opts = arg2;
				fn = arg3;
			} else {
				opts = arg2;
				ctx = arg3;
				fn = arg4;
			}
			const parentContext = ctx ?? context.active();
			const span = this.startSpan(name, opts, parentContext);
			const contextWithSpanSet = trace.setSpan(parentContext, span);
			return context.with(contextWithSpanSet, fn, void 0, span);
		}
		[inspectCustom](depth, options, inspect) {
			return formatInspect("Tracer", {
				instrumentationScope: this.instrumentationScope,
				resource: { attributes: settledResourceAttributes(this._resource) },
				spanLimits: this._spanLimits
			}, depth, options, inspect);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/MultiSpanProcessor.js
	/**
	* Implementation of the {@link SpanProcessor} that simply forwards all
	* received events to a list of {@link SpanProcessor}s.
	*/
	var MultiSpanProcessor = class {
		_spanProcessors;
		constructor(spanProcessors) {
			this._spanProcessors = spanProcessors;
		}
		forceFlush() {
			const promises = [];
			for (const spanProcessor of this._spanProcessors) promises.push(spanProcessor.forceFlush());
			return new Promise((resolve) => {
				Promise.all(promises).then(() => {
					resolve();
				}).catch((error) => {
					globalErrorHandler$1(error || /* @__PURE__ */ new Error("MultiSpanProcessor: forceFlush failed"));
					resolve();
				});
			});
		}
		onStart(span, context) {
			for (const spanProcessor of this._spanProcessors) spanProcessor.onStart(span, context);
		}
		onEnding(span) {
			for (const spanProcessor of this._spanProcessors) if (spanProcessor.onEnding) spanProcessor.onEnding(span);
		}
		onEnd(span) {
			for (const spanProcessor of this._spanProcessors) spanProcessor.onEnd(span);
		}
		shutdown() {
			const promises = [];
			for (const spanProcessor of this._spanProcessors) promises.push(spanProcessor.shutdown());
			return new Promise((resolve, reject) => {
				Promise.all(promises).then(() => {
					resolve();
				}, reject);
			});
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/sampler/AlwaysOffSampler.js
	/** Sampler that samples no traces. */
	var AlwaysOffSampler = class {
		shouldSample() {
			return { decision: SamplingDecision.NOT_RECORD };
		}
		toString() {
			return "AlwaysOffSampler";
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/sampler/AlwaysOnSampler.js
	/** Sampler that samples all traces. */
	var AlwaysOnSampler = class {
		shouldSample() {
			return { decision: SamplingDecision.RECORD_AND_SAMPLED };
		}
		toString() {
			return "AlwaysOnSampler";
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/sampler/ParentBasedSampler.js
	/**
	* A composite sampler that either respects the parent span's sampling decision
	* or delegates to `delegateSampler` for root spans.
	*/
	var ParentBasedSampler = class {
		_root;
		_remoteParentSampled;
		_remoteParentNotSampled;
		_localParentSampled;
		_localParentNotSampled;
		constructor(config) {
			this._root = config.root;
			if (!this._root) {
				globalErrorHandler$1(/* @__PURE__ */ new Error("ParentBasedSampler must have a root sampler configured"));
				this._root = new AlwaysOnSampler();
			}
			this._remoteParentSampled = config.remoteParentSampled ?? new AlwaysOnSampler();
			this._remoteParentNotSampled = config.remoteParentNotSampled ?? new AlwaysOffSampler();
			this._localParentSampled = config.localParentSampled ?? new AlwaysOnSampler();
			this._localParentNotSampled = config.localParentNotSampled ?? new AlwaysOffSampler();
		}
		shouldSample(context, traceId, spanName, spanKind, attributes, links) {
			const parentContext = trace.getSpanContext(context);
			if (!parentContext || !isSpanContextValid(parentContext)) return this._root.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			if (parentContext.isRemote) {
				if (parentContext.traceFlags & TraceFlags.SAMPLED) return this._remoteParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
				return this._remoteParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			}
			if (parentContext.traceFlags & TraceFlags.SAMPLED) return this._localParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			return this._localParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
		}
		toString() {
			return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/platform/browser/RandomIdGenerator.js
	var TRACE_ID_BYTES = 16;
	var SPAN_ID_BYTES = 8;
	var TRACE_BUFFER = new Uint8Array(TRACE_ID_BYTES);
	var SPAN_BUFFER = new Uint8Array(SPAN_ID_BYTES);
	var HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	/**
	* Fills buffer with random bytes, ensuring at least one is non-zero
	* per W3C Trace Context spec.
	*/
	function randomFill(buf) {
		for (let i = 0; i < buf.length; i++) buf[i] = Math.random() * 256 >>> 0;
		for (let i = 0; i < buf.length; i++) if (buf[i] > 0) return;
		buf[buf.length - 1] = 1;
	}
	function toHex(buf) {
		let hex = "";
		for (let i = 0; i < buf.length; i++) hex += HEX[buf[i]];
		return hex;
	}
	var RandomIdGenerator = class {
		/**
		* Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
		* characters corresponding to 128 bits.
		*/
		generateTraceId() {
			randomFill(TRACE_BUFFER);
			return toHex(TRACE_BUFFER);
		}
		/**
		* Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
		* characters corresponding to 64 bits.
		*/
		generateSpanId() {
			randomFill(SPAN_BUFFER);
			return toHex(SPAN_BUFFER);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/TracerProvider.js
	var ForceFlushState;
	(function(ForceFlushState) {
		ForceFlushState[ForceFlushState["resolved"] = 0] = "resolved";
		ForceFlushState[ForceFlushState["timeout"] = 1] = "timeout";
		ForceFlushState[ForceFlushState["error"] = 2] = "error";
		ForceFlushState[ForceFlushState["unresolved"] = 3] = "unresolved";
	})(ForceFlushState || (ForceFlushState = {}));
	/**
	* This class represents a basic tracer provider which platform libraries can extend
	*/
	var TracerProvider = class {
		_resource;
		_activeSpanProcessor;
		_forceFlushTimeoutMillis;
		_tracerOptions;
		_tracers = /* @__PURE__ */ new Map();
		constructor(options = {}) {
			this._forceFlushTimeoutMillis = options.forceFlushTimeoutMillis ?? 3e4;
			this._resource = options.resource ?? defaultResource();
			const spanProcessors = options.spanProcessors ?? [];
			this._activeSpanProcessor = new MultiSpanProcessor(spanProcessors);
			this._tracerOptions = {
				resource: this._resource,
				sampler: options.sampler ?? new ParentBasedSampler({ root: new AlwaysOnSampler() }),
				spanLimits: {
					attributeCountLimit: options.spanLimits?.attributeCountLimit ?? 128,
					attributeValueLengthLimit: options.spanLimits?.attributeValueLengthLimit ?? Infinity,
					eventCountLimit: options.spanLimits?.eventCountLimit ?? 128,
					linkCountLimit: options.spanLimits?.linkCountLimit ?? 128,
					attributePerEventCountLimit: options.spanLimits?.attributePerEventCountLimit ?? 128,
					attributePerLinkCountLimit: options.spanLimits?.attributePerLinkCountLimit ?? 128
				},
				idGenerator: options.idGenerator || new RandomIdGenerator(),
				spanProcessor: this._activeSpanProcessor,
				meterProvider: options.meterProvider ?? { getMeter() {
					return createNoopMeter();
				} }
			};
		}
		getTracer(name, version, options) {
			const key = `${name}@${version || ""}:${options?.schemaUrl || ""}`;
			if (!this._tracers.has(key)) this._tracers.set(key, new Tracer({
				name,
				version,
				schemaUrl: options?.schemaUrl
			}, this._tracerOptions));
			return this._tracers.get(key);
		}
		forceFlush() {
			const timeout = this._forceFlushTimeoutMillis;
			const promises = this._activeSpanProcessor["_spanProcessors"].map((spanProcessor) => {
				return new Promise((resolve) => {
					let state;
					const timeoutInterval = setTimeout(() => {
						resolve(/* @__PURE__ */ new Error(`Span processor did not completed within timeout period of ${timeout} ms`));
						state = ForceFlushState.timeout;
					}, timeout);
					spanProcessor.forceFlush().then(() => {
						clearTimeout(timeoutInterval);
						if (state !== ForceFlushState.timeout) {
							state = ForceFlushState.resolved;
							resolve(state);
						}
					}).catch((error) => {
						clearTimeout(timeoutInterval);
						state = ForceFlushState.error;
						resolve(error);
					});
				});
			});
			return new Promise((resolve, reject) => {
				Promise.all(promises).then((results) => {
					const errors = results.filter((result) => result !== ForceFlushState.resolved);
					if (errors.length > 0) reject(errors);
					else resolve();
				}).catch((error) => reject([error]));
			});
		}
		shutdown() {
			return this._activeSpanProcessor.shutdown();
		}
		[inspectCustom](depth, options, inspect) {
			const processors = this._activeSpanProcessor["_spanProcessors"];
			return formatInspect("TracerProvider", {
				resource: { attributes: settledResourceAttributes(this._resource) },
				tracers: Array.from(this._tracers.keys()),
				spanProcessors: processors.map((p) => p.constructor?.name ?? "SpanProcessor")
			}, depth, options, inspect);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace/build/esm/sampler/TraceIdRatioBasedSampler.js
	/** Sampler that samples a given fraction of traces based of trace id deterministically. */
	var TraceIdRatioBasedSampler = class {
		_ratio;
		_upperBound;
		constructor(ratio = 0) {
			this._ratio = this._normalize(ratio);
			this._upperBound = this._ratio === 1 ? 4294967296 : Math.floor(this._ratio * 4294967295);
		}
		shouldSample(context, traceId) {
			return { decision: isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD };
		}
		toString() {
			return `TraceIdRatioBased{${this._ratio}}`;
		}
		_normalize(ratio) {
			if (typeof ratio !== "number" || isNaN(ratio)) return 0;
			return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
		}
		_accumulate(traceId) {
			let accumulation = 0;
			for (let i = 0; i < 32; i += 8) {
				let part = 0;
				for (let j = 0; j < 8; j++) {
					const c = traceId.charCodeAt(i + j);
					const v = c < 58 ? c - 48 : c < 71 ? c - 55 : c - 87;
					part = part << 4 | v;
				}
				accumulation = (accumulation ^ part) >>> 0;
			}
			return accumulation;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js
	var TracesSamplerValues;
	(function(TracesSamplerValues) {
		TracesSamplerValues["AlwaysOff"] = "always_off";
		TracesSamplerValues["AlwaysOn"] = "always_on";
		TracesSamplerValues["ParentBasedAlwaysOff"] = "parentbased_always_off";
		TracesSamplerValues["ParentBasedAlwaysOn"] = "parentbased_always_on";
		TracesSamplerValues["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
		TracesSamplerValues["TraceIdRatio"] = "traceidratio";
	})(TracesSamplerValues || (TracesSamplerValues = {}));
	var DEFAULT_RATIO = 1;
	/**
	* Load default configuration. For fields with primitive values, any user-provided
	* value will override the corresponding default value. For fields with
	* non-primitive values (like `spanLimits`), the user-provided value will be
	* used to extend the default value.
	*/
	function loadDefaultConfig() {
		return {
			sampler: buildSamplerFromEnv(),
			forceFlushTimeoutMillis: 3e4,
			generalLimits: {
				attributeValueLengthLimit: Infinity,
				attributeCountLimit: 128
			},
			spanLimits: {
				attributeValueLengthLimit: Infinity,
				attributeCountLimit: 128,
				linkCountLimit: 128,
				eventCountLimit: 128,
				attributePerEventCountLimit: 128,
				attributePerLinkCountLimit: 128
			}
		};
	}
	/**
	* Based on environment, builds a sampler, complies with specification.
	*/
	function buildSamplerFromEnv() {
		const sampler = TracesSamplerValues.ParentBasedAlwaysOn;
		switch (sampler) {
			case TracesSamplerValues.AlwaysOn: return new AlwaysOnSampler();
			case TracesSamplerValues.AlwaysOff: return new AlwaysOffSampler();
			case TracesSamplerValues.ParentBasedAlwaysOn: return new ParentBasedSampler({ root: new AlwaysOnSampler() });
			case TracesSamplerValues.ParentBasedAlwaysOff: return new ParentBasedSampler({ root: new AlwaysOffSampler() });
			case TracesSamplerValues.TraceIdRatio: return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv());
			case TracesSamplerValues.ParentBasedTraceIdRatio: return new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv()) });
			default:
				diag.error(`OTEL_TRACES_SAMPLER value "${sampler}" invalid, defaulting to "${TracesSamplerValues.ParentBasedAlwaysOn}".`);
				return new ParentBasedSampler({ root: new AlwaysOnSampler() });
		}
	}
	function getSamplerProbabilityFromEnv() {
		diag.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`);
		return DEFAULT_RATIO;
	}
	/**
	* When general limits are provided and model specific limits are not,
	* configures the model specific limits by using the values from the general ones.
	* @param userConfig User provided tracer configuration
	*/
	function reconfigureLimits(userConfig) {
		const spanLimits = Object.assign({}, userConfig.spanLimits);
		/**
		* Reassign span attribute count limit to use first non null value defined by user or use default value
		*/
		spanLimits.attributeCountLimit = userConfig.spanLimits?.attributeCountLimit ?? userConfig.generalLimits?.attributeCountLimit ?? void 0 ?? void 0 ?? 128;
		/**
		* Reassign span attribute value length limit to use first non null value defined by user or use default value
		*/
		spanLimits.attributeValueLengthLimit = userConfig.spanLimits?.attributeValueLengthLimit ?? userConfig.generalLimits?.attributeValueLengthLimit ?? void 0 ?? void 0 ?? Infinity;
		return Object.assign({}, userConfig, { spanLimits });
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/node_modules/@opentelemetry/sdk-trace-base/build/esm/BasicTracerProvider-shim.js
	/**
	* A TracerProvider implementation that reads configuration defaults from
	* OTEL_* environment variables per
	* https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
	*/
	var BasicTracerProvider = class extends TracerProvider {
		constructor(config = {}) {
			const mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
			delete mergedConfig.generalLimits;
			super(mergedConfig);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/build/esm/StackContextManager.js
	/**
	* Stack Context Manager for managing the state in web
	* it doesn't fully support the async calls though
	*/
	var StackContextManager = class {
		/**
		* whether the context manager is enabled or not
		*/
		_enabled = false;
		/**
		* Keeps the reference to current context
		*/
		_currentContext = ROOT_CONTEXT;
		/**
		*
		* @param context
		* @param target Function to be executed within the context
		*/
		_bindFunction(context = ROOT_CONTEXT, target) {
			const manager = this;
			const contextWrapper = function(...args) {
				return manager.with(context, () => target.apply(this, args));
			};
			Object.defineProperty(contextWrapper, "length", {
				enumerable: false,
				configurable: true,
				writable: false,
				value: target.length
			});
			return contextWrapper;
		}
		/**
		* Returns the active context
		*/
		active() {
			return this._currentContext;
		}
		/**
		* Binds a the certain context or the active one to the target function and then returns the target
		* @param context A context (span) to be bind to target
		* @param target a function or event emitter. When target or one of its callbacks is called,
		*  the provided context will be used as the active context for the duration of the call.
		*/
		bind(context, target) {
			if (context === void 0) context = this.active();
			if (typeof target === "function") return this._bindFunction(context, target);
			return target;
		}
		/**
		* Disable the context manager (clears the current context)
		*/
		disable() {
			this._currentContext = ROOT_CONTEXT;
			this._enabled = false;
			return this;
		}
		/**
		* Enables the context manager and creates a default(root) context
		*/
		enable() {
			if (this._enabled) return this;
			this._enabled = true;
			this._currentContext = ROOT_CONTEXT;
			return this;
		}
		/**
		* Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
		* The context will be set as active
		* @param context
		* @param fn Callback function
		* @param thisArg optional receiver to be used for calling fn
		* @param args optional arguments forwarded to fn
		*/
		with(context, fn, thisArg, ...args) {
			const previousContext = this._currentContext;
			this._currentContext = context || ROOT_CONTEXT;
			try {
				return fn.call(thisArg, ...args);
			} finally {
				this._currentContext = previousContext;
			}
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-web/build/esm/WebTracerProvider.js
	function setupContextManager(contextManager) {
		if (contextManager === null) return;
		if (contextManager === void 0) {
			const defaultContextManager = new StackContextManager();
			defaultContextManager.enable();
			context.setGlobalContextManager(defaultContextManager);
			return;
		}
		contextManager.enable();
		context.setGlobalContextManager(contextManager);
	}
	function setupPropagator(propagator) {
		if (propagator === null) return;
		if (propagator === void 0) {
			propagation.setGlobalPropagator(new CompositePropagator({ propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()] }));
			return;
		}
		propagation.setGlobalPropagator(propagator);
	}
	/**
	* This class represents a web tracer with {@link StackContextManager}
	*/
	var WebTracerProvider = class extends BasicTracerProvider {
		/**
		* Constructs a new Tracer instance.
		* @param config Web Tracer config
		*/
		constructor(config = {}) {
			super(config);
		}
		/**
		* Register this TracerProvider for use with the OpenTelemetry API.
		* Undefined values may be replaced with defaults, and
		* null values will be skipped.
		*
		* @param config Configuration object for SDK registration
		*/
		register(config = {}) {
			trace.setGlobalTracerProvider(this);
			setupPropagator(config.propagator);
			setupContextManager(config.contextManager);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
	var SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
	function suppressTracing(context) {
		return context.setValue(SUPPRESS_TRACING_KEY, true);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/core/build/esm/common/logging-error-handler.js
	/**
	* Returns a function that logs an error using the provided logger, or a
	* console logger if one was not provided.
	*/
	function loggingErrorHandler() {
		return (ex) => {
			diag.error(stringifyException(ex));
		};
	}
	/**
	* Converts an exception into a string representation
	* @param {Exception} ex
	*/
	function stringifyException(ex) {
		if (typeof ex === "string") return ex;
		else return JSON.stringify(flattenException(ex));
	}
	/**
	* Flattens an exception into key-value pairs by traversing the prototype chain
	* and coercing values to strings. Duplicate properties will not be overwritten;
	* the first insert wins.
	*/
	function flattenException(ex) {
		const result = {};
		let current = ex;
		while (current !== null) {
			Object.getOwnPropertyNames(current).forEach((propertyName) => {
				if (result[propertyName]) return;
				const value = current[propertyName];
				if (value) result[propertyName] = String(value);
			});
			current = Object.getPrototypeOf(current);
		}
		return result;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js
	/** The global error handler delegate */
	var delegateHandler = loggingErrorHandler();
	/**
	* Return the global error handler
	* @param {Exception} ex
	*/
	function globalErrorHandler(ex) {
		try {
			delegateHandler(ex);
		} catch {}
	}
	var SECOND_TO_NANOSECONDS = Math.pow(10, 9);
	/**
	* Convert hrTime to nanoseconds.
	* @param time
	*/
	function hrTimeToNanoseconds(time) {
		return time[0] * SECOND_TO_NANOSECONDS + time[1];
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/core/build/esm/ExportResult.js
	var ExportResultCode;
	(function(ExportResultCode) {
		ExportResultCode[ExportResultCode["SUCCESS"] = 0] = "SUCCESS";
		ExportResultCode[ExportResultCode["FAILED"] = 1] = "FAILED";
	})(ExportResultCode || (ExportResultCode = {}));
	//#endregion
	//#region ../../../node_modules/@opentelemetry/core/build/esm/utils/promise.js
	var Deferred = class {
		_promise;
		_resolve;
		_reject;
		constructor() {
			this._promise = new Promise((resolve, reject) => {
				this._resolve = resolve;
				this._reject = reject;
			});
		}
		get promise() {
			return this._promise;
		}
		resolve(val) {
			this._resolve(val);
		}
		reject(err) {
			this._reject(err);
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/core/build/esm/utils/callback.js
	/**
	* Bind the callback and only invoke the callback once regardless how many times `BindOnceFuture.call` is invoked.
	*/
	var BindOnceFuture = class {
		_isCalled = false;
		_deferred = new Deferred();
		_callback;
		_that;
		constructor(callback, that) {
			this._callback = callback;
			this._that = that;
		}
		get isCalled() {
			return this._isCalled;
		}
		get promise() {
			return this._deferred.promise;
		}
		call(...args) {
			if (!this._isCalled) {
				this._isCalled = true;
				try {
					Promise.resolve(this._callback.call(this._that, ...args)).then((val) => this._deferred.resolve(val), (err) => this._deferred.reject(err));
				} catch (err) {
					this._deferred.reject(err);
				}
			}
			return this._deferred.promise;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-base/build/esm/export/BatchSpanProcessorBase.js
	/**
	* Implementation of the {@link SpanProcessor} that batches spans exported by
	* the SDK then pushes them to the exporter pipeline.
	*/
	var BatchSpanProcessorBase = class {
		_maxExportBatchSize;
		_maxQueueSize;
		_scheduledDelayMillis;
		_exportTimeoutMillis;
		_exporter;
		_isExporting = false;
		_finishedSpans = [];
		_timer;
		_shutdownOnce;
		_droppedSpansCount = 0;
		constructor(exporter, config) {
			this._exporter = exporter;
			this._maxExportBatchSize = typeof config?.maxExportBatchSize === "number" ? config.maxExportBatchSize : 512;
			this._maxQueueSize = typeof config?.maxQueueSize === "number" ? config.maxQueueSize : 2048;
			this._scheduledDelayMillis = typeof config?.scheduledDelayMillis === "number" ? config.scheduledDelayMillis : 5e3;
			this._exportTimeoutMillis = typeof config?.exportTimeoutMillis === "number" ? config.exportTimeoutMillis : 3e4;
			this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
			if (this._maxExportBatchSize > this._maxQueueSize) {
				diag.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize");
				this._maxExportBatchSize = this._maxQueueSize;
			}
		}
		forceFlush() {
			if (this._shutdownOnce.isCalled) return this._shutdownOnce.promise;
			return this._flushAll();
		}
		onStart(_span, _parentContext) {}
		onEnd(span) {
			if (this._shutdownOnce.isCalled) return;
			if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) return;
			this._addToBuffer(span);
		}
		shutdown() {
			return this._shutdownOnce.call();
		}
		_shutdown() {
			return Promise.resolve().then(() => {
				return this.onShutdown();
			}).then(() => {
				return this._flushAll();
			}).then(() => {
				return this._exporter.shutdown();
			});
		}
		/** Add a span in the buffer. */
		_addToBuffer(span) {
			if (this._finishedSpans.length >= this._maxQueueSize) {
				if (this._droppedSpansCount === 0) diag.debug("maxQueueSize reached, dropping spans");
				this._droppedSpansCount++;
				return;
			}
			if (this._droppedSpansCount > 0) {
				diag.warn(`Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`);
				this._droppedSpansCount = 0;
			}
			this._finishedSpans.push(span);
			this._maybeStartTimer();
		}
		/**
		* Send all spans to the exporter respecting the batch size limit
		* This function is used only on forceFlush or shutdown,
		* for all other cases _flush should be used
		* */
		_flushAll() {
			return new Promise((resolve, reject) => {
				const promises = [];
				const count = Math.ceil(this._finishedSpans.length / this._maxExportBatchSize);
				for (let i = 0, j = count; i < j; i++) promises.push(this._flushOneBatch());
				Promise.all(promises).then(() => {
					resolve();
				}).catch(reject);
			});
		}
		_flushOneBatch() {
			this._clearTimer();
			if (this._finishedSpans.length === 0) return Promise.resolve();
			return new Promise((resolve, reject) => {
				const timer = setTimeout(() => {
					reject(/* @__PURE__ */ new Error("Timeout"));
				}, this._exportTimeoutMillis);
				context.with(suppressTracing(context.active()), () => {
					let spans;
					if (this._finishedSpans.length <= this._maxExportBatchSize) {
						spans = this._finishedSpans;
						this._finishedSpans = [];
					} else spans = this._finishedSpans.splice(0, this._maxExportBatchSize);
					const doExport = () => this._exporter.export(spans, (result) => {
						clearTimeout(timer);
						if (result.code === ExportResultCode.SUCCESS) resolve();
						else reject(result.error ?? /* @__PURE__ */ new Error("BatchSpanProcessor: span export failed"));
					});
					let pendingResources = null;
					for (let i = 0, len = spans.length; i < len; i++) {
						const span = spans[i];
						if (span.resource.asyncAttributesPending && span.resource.waitForAsyncAttributes) {
							pendingResources ??= [];
							pendingResources.push(span.resource.waitForAsyncAttributes());
						}
					}
					if (pendingResources === null) doExport();
					else Promise.all(pendingResources).then(doExport, (err) => {
						globalErrorHandler(err);
						reject(err);
					});
				});
			});
		}
		_maybeStartTimer() {
			if (this._isExporting) return;
			const flush = () => {
				this._isExporting = true;
				this._flushOneBatch().finally(() => {
					this._isExporting = false;
					if (this._finishedSpans.length > 0) {
						this._clearTimer();
						this._maybeStartTimer();
					}
				}).catch((e) => {
					this._isExporting = false;
					globalErrorHandler(e);
				});
			};
			if (this._finishedSpans.length >= this._maxExportBatchSize) return flush();
			if (this._timer !== void 0) return;
			this._timer = setTimeout(() => flush(), this._scheduledDelayMillis);
			if (typeof this._timer !== "number") this._timer.unref();
		}
		_clearTimer() {
			if (this._timer !== void 0) {
				clearTimeout(this._timer);
				this._timer = void 0;
			}
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/sdk-trace-base/build/esm/platform/browser/export/BatchSpanProcessor.js
	var BatchSpanProcessor = class extends BatchSpanProcessorBase {
		_visibilityChangeListener;
		_pageHideListener;
		constructor(_exporter, config) {
			super(_exporter, config);
			this.onInit(config);
		}
		onInit(config) {
			if (config?.disableAutoFlushOnDocumentHide !== true && typeof document !== "undefined") {
				this._visibilityChangeListener = () => {
					if (document.visibilityState === "hidden") this.forceFlush().catch((error) => {
						globalErrorHandler(error);
					});
				};
				this._pageHideListener = () => {
					this.forceFlush().catch((error) => {
						globalErrorHandler(error);
					});
				};
				document.addEventListener("visibilitychange", this._visibilityChangeListener);
				document.addEventListener("pagehide", this._pageHideListener);
			}
		}
		onShutdown() {
			if (typeof document !== "undefined") {
				if (this._visibilityChangeListener) document.removeEventListener("visibilitychange", this._visibilityChangeListener);
				if (this._pageHideListener) document.removeEventListener("pagehide", this._pageHideListener);
			}
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/OTLPExporterBase.js
	var OTLPExporterBase = class {
		_delegate;
		constructor(delegate) {
			this._delegate = delegate;
		}
		/**
		* Export items.
		* @param items
		* @param resultCallback
		*/
		export(items, resultCallback) {
			this._delegate.export(items, resultCallback);
		}
		forceFlush() {
			return this._delegate.forceFlush();
		}
		shutdown() {
			return this._delegate.shutdown();
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/types.js
	/**
	* Interface for handling error
	*/
	var OTLPExporterError = class extends Error {
		code;
		name = "OTLPExporterError";
		data;
		constructor(message, code, data) {
			super(message);
			this.data = data;
			this.code = code;
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/shared-configuration.js
	function validateTimeoutMillis(timeoutMillis) {
		if (Number.isFinite(timeoutMillis) && timeoutMillis > 0) return timeoutMillis;
		throw new Error(`Configuration: timeoutMillis is invalid, expected number greater than 0 (actual: '${timeoutMillis}')`);
	}
	function wrapStaticHeadersInFunction(headers) {
		if (headers == null) return;
		return async () => headers;
	}
	/**
	* @param userProvidedConfiguration  Configuration options provided by the user in code.
	* @param fallbackConfiguration Fallback to use when the {@link userProvidedConfiguration} does not specify an option.
	* @param defaultConfiguration The defaults as defined by the exporter specification
	*/
	function mergeOtlpSharedConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration) {
		return {
			timeoutMillis: validateTimeoutMillis(userProvidedConfiguration.timeoutMillis ?? fallbackConfiguration.timeoutMillis ?? defaultConfiguration.timeoutMillis),
			concurrencyLimit: userProvidedConfiguration.concurrencyLimit ?? fallbackConfiguration.concurrencyLimit ?? defaultConfiguration.concurrencyLimit,
			compression: userProvidedConfiguration.compression ?? fallbackConfiguration.compression ?? defaultConfiguration.compression
		};
	}
	function getSharedConfigurationDefaults() {
		return {
			timeoutMillis: 1e4,
			concurrencyLimit: 30,
			compression: "none"
		};
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/bounded-queue-export-promise-handler.js
	var BoundedQueueExportPromiseHandler = class {
		_concurrencyLimit;
		_sendingPromises = [];
		/**
		* @param concurrencyLimit maximum promises allowed in a queue at the same time.
		*/
		constructor(concurrencyLimit) {
			this._concurrencyLimit = concurrencyLimit;
		}
		pushPromise(promise) {
			if (this.hasReachedLimit()) throw new Error("Concurrency Limit reached");
			this._sendingPromises.push(promise);
			const popPromise = () => {
				const index = this._sendingPromises.indexOf(promise);
				this._sendingPromises.splice(index, 1);
			};
			promise.then(popPromise, popPromise);
		}
		hasReachedLimit() {
			return this._sendingPromises.length >= this._concurrencyLimit;
		}
		async awaitAll() {
			await Promise.all(this._sendingPromises);
		}
	};
	/**
	* Promise queue for keeping track of export promises. Finished promises will be auto-dequeued.
	* Allows for awaiting all promises in the queue.
	*/
	function createBoundedQueueExportPromiseHandler(options) {
		return new BoundedQueueExportPromiseHandler(options.concurrencyLimit);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/logging-response-handler.js
	function isPartialSuccessResponse(response) {
		return Object.prototype.hasOwnProperty.call(response, "partialSuccess");
	}
	/**
	* Default response handler that logs a partial success to the console.
	*/
	function createLoggingPartialSuccessResponseHandler() {
		return { handleResponse(response) {
			if (response == null || !isPartialSuccessResponse(response) || response.partialSuccess == null || Object.keys(response.partialSuccess).length === 0) return;
			diag.warn("Received Partial Success response:", JSON.stringify(response.partialSuccess));
		} };
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-export-delegate.js
	var OTLPExportDelegate = class {
		_diagLogger;
		_transport;
		_serializer;
		_responseHandler;
		_promiseQueue;
		_timeout;
		constructor(transport, serializer, responseHandler, promiseQueue, timeout) {
			this._transport = transport;
			this._serializer = serializer;
			this._responseHandler = responseHandler;
			this._promiseQueue = promiseQueue;
			this._timeout = timeout;
			this._diagLogger = diag.createComponentLogger({ namespace: "OTLPExportDelegate" });
		}
		export(internalRepresentation, resultCallback) {
			this._diagLogger.debug("items to be sent", internalRepresentation);
			if (this._promiseQueue.hasReachedLimit()) {
				resultCallback({
					code: ExportResultCode.FAILED,
					error: /* @__PURE__ */ new Error("Concurrent export limit reached")
				});
				return;
			}
			const serializedRequest = this._serializer.serializeRequest(internalRepresentation);
			if (serializedRequest == null) {
				resultCallback({
					code: ExportResultCode.FAILED,
					error: /* @__PURE__ */ new Error("Nothing to send")
				});
				return;
			}
			this._promiseQueue.pushPromise(this._transport.send(serializedRequest, this._timeout).then((response) => {
				if (response.status === "success") {
					if (response.data != null) try {
						this._responseHandler.handleResponse(this._serializer.deserializeResponse(response.data));
					} catch (e) {
						this._diagLogger.warn("Export succeeded but could not deserialize response - is the response specification compliant?", e, response.data);
					}
					resultCallback({ code: ExportResultCode.SUCCESS });
					return;
				} else if (response.status === "failure" && response.error) {
					resultCallback({
						code: ExportResultCode.FAILED,
						error: response.error
					});
					return;
				} else if (response.status === "retryable") resultCallback({
					code: ExportResultCode.FAILED,
					error: response.error ?? new OTLPExporterError("Export failed with retryable status")
				});
				else resultCallback({
					code: ExportResultCode.FAILED,
					error: new OTLPExporterError("Export failed with unknown error")
				});
			}, (reason) => resultCallback({
				code: ExportResultCode.FAILED,
				error: reason
			})));
		}
		forceFlush() {
			return this._promiseQueue.awaitAll();
		}
		async shutdown() {
			this._diagLogger.debug("shutdown started");
			await this.forceFlush();
			this._transport.shutdown();
		}
	};
	/**
	* Creates a generic delegate for OTLP exports which only contains parts of the OTLP export that are shared across all
	* signals.
	*/
	function createOtlpExportDelegate(components, settings) {
		return new OTLPExportDelegate(components.transport, components.serializer, createLoggingPartialSuccessResponseHandler(), components.promiseHandler, settings.timeout);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-network-export-delegate.js
	function createOtlpNetworkExportDelegate(options, serializer, transport) {
		return createOtlpExportDelegate({
			transport,
			serializer,
			promiseHandler: createBoundedQueueExportPromiseHandler(options)
		}, { timeout: options.timeoutMillis });
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-transformer/build/esm/common/internal.js
	function createResource(resource, encoder) {
		const result = {
			attributes: toAttributes(resource.attributes, encoder),
			droppedAttributesCount: 0
		};
		const schemaUrl = resource.schemaUrl;
		if (schemaUrl && schemaUrl !== "") result.schemaUrl = schemaUrl;
		return result;
	}
	function createInstrumentationScope(scope, encoder) {
		const result = {
			name: scope.name,
			version: scope.version
		};
		if (scope.attributes && Object.keys(scope.attributes).length > 0) {
			result.attributes = toAttributes(scope.attributes, encoder);
			result.droppedAttributesCount = scope.droppedAttributesCount ?? 0;
		}
		return result;
	}
	function toAttributes(attributes, encoder) {
		return Object.keys(attributes).map((key) => toKeyValue(key, attributes[key], encoder));
	}
	function toKeyValue(key, value, encoder) {
		return {
			key,
			value: toAnyValue(value, encoder)
		};
	}
	function toAnyValue(value, encoder) {
		const t = typeof value;
		if (t === "string") return { stringValue: value };
		if (t === "number") {
			if (!Number.isInteger(value)) return { doubleValue: value };
			return { intValue: value };
		}
		if (t === "boolean") return { boolValue: value };
		if (value instanceof Uint8Array) return { bytesValue: encoder.encodeUint8Array(value) };
		if (Array.isArray(value)) {
			const values = new Array(value.length);
			for (let i = 0; i < value.length; i++) values[i] = toAnyValue(value[i], encoder);
			return { arrayValue: { values } };
		}
		if (t === "object" && value != null) {
			const keys = Object.keys(value);
			const values = new Array(keys.length);
			for (let i = 0; i < keys.length; i++) values[i] = {
				key: keys[i],
				value: toAnyValue(value[keys[i]], encoder)
			};
			return { kvlistValue: { values } };
		}
		return {};
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-transformer/build/esm/common/utils.js
	function hrTimeToNanos(hrTime) {
		const NANOSECONDS = BigInt(1e9);
		return BigInt(Math.trunc(hrTime[0])) * NANOSECONDS + BigInt(Math.trunc(hrTime[1]));
	}
	function encodeAsString(hrTime) {
		return hrTimeToNanos(hrTime).toString();
	}
	var encodeTimestamp = typeof BigInt !== "undefined" ? encodeAsString : hrTimeToNanoseconds;
	function identity(value) {
		return value;
	}
	/**
	* Encoder for JSON format.
	* Uses string timestamps, hex for span/trace IDs, and base64 for Uint8Array.
	*/
	var JSON_ENCODER = {
		encodeHrTime: encodeTimestamp,
		encodeSpanContext: identity,
		encodeOptionalSpanContext: identity,
		encodeUint8Array: (bytes) => {
			if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
			const chars = new Array(bytes.length);
			for (let i = 0; i < bytes.length; i++) chars[i] = String.fromCharCode(bytes[i]);
			return btoa(chars.join(""));
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-transformer/build/esm/trace/internal.js
	var SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK = 256;
	var SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK = 512;
	/**
	* Builds the 32-bit span flags value combining the low 8-bit W3C TraceFlags
	* with the HAS_IS_REMOTE and IS_REMOTE bits according to the OTLP spec.
	*/
	function buildSpanFlagsFrom(traceFlags, isRemote) {
		let flags = traceFlags & 255 | SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK;
		if (isRemote) flags |= SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK;
		return flags;
	}
	function sdkSpanToOtlpSpan(span, encoder) {
		const ctx = span.spanContext();
		const status = span.status;
		const parentSpanId = span.parentSpanContext?.spanId ? encoder.encodeSpanContext(span.parentSpanContext?.spanId) : void 0;
		return {
			traceId: encoder.encodeSpanContext(ctx.traceId),
			spanId: encoder.encodeSpanContext(ctx.spanId),
			parentSpanId,
			traceState: ctx.traceState?.serialize(),
			name: span.name,
			kind: span.kind == null ? 0 : span.kind + 1,
			startTimeUnixNano: encoder.encodeHrTime(span.startTime),
			endTimeUnixNano: encoder.encodeHrTime(span.endTime),
			attributes: toAttributes(span.attributes, encoder),
			droppedAttributesCount: span.droppedAttributesCount,
			events: span.events.map((event) => toOtlpSpanEvent(event, encoder)),
			droppedEventsCount: span.droppedEventsCount,
			status: {
				code: status.code,
				message: status.message
			},
			links: span.links.map((link) => toOtlpLink(link, encoder)),
			droppedLinksCount: span.droppedLinksCount,
			flags: buildSpanFlagsFrom(ctx.traceFlags, span.parentSpanContext?.isRemote)
		};
	}
	function toOtlpLink(link, encoder) {
		return {
			attributes: link.attributes ? toAttributes(link.attributes, encoder) : [],
			spanId: encoder.encodeSpanContext(link.context.spanId),
			traceId: encoder.encodeSpanContext(link.context.traceId),
			traceState: link.context.traceState?.serialize(),
			droppedAttributesCount: link.droppedAttributesCount || 0,
			flags: buildSpanFlagsFrom(link.context.traceFlags, link.context.isRemote)
		};
	}
	function toOtlpSpanEvent(timedEvent, encoder) {
		return {
			attributes: timedEvent.attributes ? toAttributes(timedEvent.attributes, encoder) : [],
			name: timedEvent.name,
			timeUnixNano: encoder.encodeHrTime(timedEvent.time),
			droppedAttributesCount: timedEvent.droppedAttributesCount || 0
		};
	}
	function createExportTraceServiceRequest(spans, encoder) {
		return { resourceSpans: spanRecordsToResourceSpans(spans, encoder) };
	}
	function createResourceMap(readableSpans) {
		const resourceMap = /* @__PURE__ */ new Map();
		for (const record of readableSpans) {
			let ilsMap = resourceMap.get(record.resource);
			if (!ilsMap) {
				ilsMap = /* @__PURE__ */ new Map();
				resourceMap.set(record.resource, ilsMap);
			}
			const instrumentationScopeKey = `${record.instrumentationScope.name}@${record.instrumentationScope.version || ""}:${record.instrumentationScope.schemaUrl || ""}`;
			let records = ilsMap.get(instrumentationScopeKey);
			if (!records) {
				records = [];
				ilsMap.set(instrumentationScopeKey, records);
			}
			records.push(record);
		}
		return resourceMap;
	}
	function spanRecordsToResourceSpans(readableSpans, encoder) {
		const resourceMap = createResourceMap(readableSpans);
		const out = [];
		const entryIterator = resourceMap.entries();
		let entry = entryIterator.next();
		while (!entry.done) {
			const [resource, ilmMap] = entry.value;
			const scopeResourceSpans = [];
			const ilmIterator = ilmMap.values();
			let ilmEntry = ilmIterator.next();
			while (!ilmEntry.done) {
				const scopeSpans = ilmEntry.value;
				if (scopeSpans.length > 0) {
					const spans = scopeSpans.map((readableSpan) => sdkSpanToOtlpSpan(readableSpan, encoder));
					scopeResourceSpans.push({
						scope: createInstrumentationScope(scopeSpans[0].instrumentationScope, encoder),
						spans,
						schemaUrl: scopeSpans[0].instrumentationScope.schemaUrl
					});
				}
				ilmEntry = ilmIterator.next();
			}
			const processedResource = createResource(resource, encoder);
			const transformedSpans = {
				resource: processedResource,
				scopeSpans: scopeResourceSpans,
				schemaUrl: processedResource.schemaUrl
			};
			out.push(transformedSpans);
			entry = entryIterator.next();
		}
		return out;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-transformer/build/esm/trace/json/trace.js
	var JsonTraceSerializer = {
		serializeRequest: (arg) => {
			const request = createExportTraceServiceRequest(arg, JSON_ENCODER);
			return new TextEncoder().encode(JSON.stringify(request));
		},
		deserializeResponse: (arg) => {
			if (arg.length === 0) return {};
			const decoder = new TextDecoder();
			try {
				return JSON.parse(decoder.decode(arg));
			} catch (err) {
				diag.warn(`Failed to parse trace export response: ${err.message}. Returning empty response`);
				return {};
			}
		}
	};
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/retrying-transport.js
	var MAX_ATTEMPTS = 5;
	var INITIAL_BACKOFF = 1e3;
	var MAX_BACKOFF = 5e3;
	var BACKOFF_MULTIPLIER = 1.5;
	var JITTER = .2;
	/**
	* Get a pseudo-random jitter that falls in the range of [-JITTER, +JITTER]
	*/
	function getJitter() {
		return Math.random() * (2 * JITTER) - JITTER;
	}
	var RetryingTransport = class {
		_transport;
		constructor(transport) {
			this._transport = transport;
		}
		retry(data, timeoutMillis, inMillis) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					this._transport.send(data, timeoutMillis).then(resolve, reject);
				}, inMillis);
			});
		}
		async send(data, timeoutMillis) {
			let attempts = MAX_ATTEMPTS;
			let nextBackoff = INITIAL_BACKOFF;
			const deadline = Date.now() + timeoutMillis;
			let result = await this._transport.send(data, timeoutMillis);
			while (result.status === "retryable" && attempts > 0) {
				attempts--;
				const backoff = Math.max(Math.min(nextBackoff * (1 + getJitter()), MAX_BACKOFF), 0);
				nextBackoff = nextBackoff * BACKOFF_MULTIPLIER;
				const retryInMillis = result.retryInMillis ?? backoff;
				const remainingTimeoutMillis = deadline - Date.now();
				if (retryInMillis > remainingTimeoutMillis) {
					diag.info(`Export retry time ${Math.round(retryInMillis)}ms exceeds remaining timeout ${Math.round(remainingTimeoutMillis)}ms, not retrying further.`);
					return result;
				}
				diag.verbose(`Scheduling export retry in ${Math.round(retryInMillis)}ms`);
				result = await this.retry(data, remainingTimeoutMillis, retryInMillis);
			}
			if (result.status === "success") diag.verbose(`Export succeeded after ${MAX_ATTEMPTS - attempts} retry attempts.`);
			else if (result.status === "retryable") diag.info(`Export failed after maximum retry attempts (${MAX_ATTEMPTS}).`);
			else diag.info(`Export failed with non-retryable error: ${result.error}`);
			return result;
		}
		shutdown() {
			return this._transport.shutdown();
		}
	};
	/**
	* Creates an Exporter Transport that retries on 'retryable' response.
	*/
	function createRetryingTransport(options) {
		return new RetryingTransport(options.transport);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/is-export-retryable.js
	function isExportHTTPErrorRetryable(statusCode) {
		return statusCode === 429 || statusCode === 502 || statusCode === 503 || statusCode === 504;
	}
	function parseRetryAfterToMills(retryAfter) {
		if (retryAfter == null) return;
		const seconds = Number.parseInt(retryAfter, 10);
		if (Number.isInteger(seconds)) return seconds > 0 ? seconds * 1e3 : -1;
		const delay = new Date(retryAfter).getTime() - Date.now();
		if (delay >= 0) return delay;
		return 0;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/transport/fetch-transport.js
	/**
	* Maximum total body size for concurrent keepalive requests.
	* Browsers enforce a 64KiB cumulative limit across all pending keepalive requests.
	* We use 60KB to leave headroom for headers.
	* @see https://github.com/whatwg/fetch/issues/679
	* @see https://blog.huli.tw/2025/01/06/en/navigator-sendbeacon-64kib-and-source-code/
	*/
	var MAX_KEEPALIVE_BODY_SIZE = 61440;
	/**
	* Maximum concurrent keepalive requests.
	* Chrome enforces 9 concurrent keepalive fetch requests per renderer process.
	* @see https://github.com/whatwg/fetch/issues/679
	* Quote: "If the renderer process is processing more than 9 requests with keepalive set, we reject a new request"
	*/
	var MAX_KEEPALIVE_REQUESTS = 9;
	/**
	* Track cumulative pending body size across all in-flight keepalive requests.
	* This is necessary because the 64KiB limit is cumulative, not per-request.
	*/
	var pendingBodySize = 0;
	/**
	* Track number of pending keepalive requests.
	*/
	var pendingKeepaliveCount = 0;
	var FetchTransport = class {
		_parameters;
		constructor(parameters) {
			this._parameters = parameters;
		}
		async send(data, timeoutMillis) {
			const abortController = new AbortController();
			const timeout = setTimeout(() => abortController.abort(), timeoutMillis);
			let fetchApi = globalThis.fetch;
			if (typeof fetchApi.__original === "function") fetchApi = fetchApi.__original;
			const requestSize = data.byteLength;
			const wouldExceedSize = pendingBodySize + requestSize > MAX_KEEPALIVE_BODY_SIZE;
			const useKeepalive = !wouldExceedSize && !(pendingKeepaliveCount >= MAX_KEEPALIVE_REQUESTS);
			if (useKeepalive) {
				pendingBodySize += requestSize;
				pendingKeepaliveCount++;
			} else {
				const reason = wouldExceedSize ? "size limit" : "count limit";
				diag.debug(`keepalive disabled: ${(requestSize / 1024).toFixed(1)}KB payload, ${pendingKeepaliveCount} pending (${reason})`);
			}
			try {
				const url = new URL(this._parameters.url);
				const response = await fetchApi(url.href, {
					method: "POST",
					headers: await this._parameters.headers(),
					body: data,
					signal: abortController.signal,
					keepalive: useKeepalive,
					mode: globalThis.location ? globalThis.location.origin === url.origin ? "same-origin" : "cors" : "no-cors"
				});
				if (response.status >= 200 && response.status <= 299) {
					diag.debug(`export response success (status: ${response.status})`);
					return { status: "success" };
				} else if (isExportHTTPErrorRetryable(response.status)) {
					diag.warn(`export response retryable (status: ${response.status})`);
					return {
						status: "retryable",
						retryInMillis: parseRetryAfterToMills(response.headers.get("Retry-After"))
					};
				}
				diag.error(`export response failure (status: ${response.status})`);
				return {
					status: "failure",
					error: /* @__PURE__ */ new Error(`Fetch request failed with non-retryable status ${response.status}`)
				};
			} catch (error) {
				if (isFetchNetworkErrorRetryable(error)) {
					diag.warn(`export request retryable (network error: ${error})`);
					return {
						status: "retryable",
						error: new Error("Fetch request encountered a network error", { cause: error })
					};
				}
				diag.error(`export request failure (error: ${error})`);
				return {
					status: "failure",
					error: new Error("Fetch request errored", { cause: error })
				};
			} finally {
				clearTimeout(timeout);
				if (useKeepalive) {
					pendingBodySize -= requestSize;
					pendingKeepaliveCount--;
				}
			}
		}
		shutdown() {}
	};
	/**
	* Creates an exporter transport that uses `fetch` to send the data
	* @param parameters applied to each request made by transport
	*/
	function createFetchTransport(parameters) {
		return new FetchTransport(parameters);
	}
	function isFetchNetworkErrorRetryable(error) {
		return error instanceof TypeError && !error.cause;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-browser-http-export-delegate.js
	function createOtlpFetchExportDelegate(options, serializer) {
		return createOtlpNetworkExportDelegate(options, serializer, createRetryingTransport({ transport: createFetchTransport(options) }));
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/util.js
	/**
	* Parses headers from config leaving only those that have defined values
	* @param partialHeaders
	*/
	function validateAndNormalizeHeaders(partialHeaders) {
		const headers = {};
		Object.entries(partialHeaders ?? {}).forEach(([key, value]) => {
			if (typeof value !== "undefined") headers[key] = String(value);
			else diag.warn(`Header "${key}" has invalid value (${value}) and will be ignored`);
		});
		return headers;
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/otlp-http-configuration.js
	function mergeHeaders(userProvidedHeaders, fallbackHeaders, defaultHeaders) {
		return async () => {
			const requiredHeaders = { ...await defaultHeaders() };
			const headers = {};
			if (fallbackHeaders != null) Object.assign(headers, await fallbackHeaders());
			if (userProvidedHeaders != null) Object.assign(headers, validateAndNormalizeHeaders(await userProvidedHeaders()));
			return Object.assign(headers, requiredHeaders);
		};
	}
	function validateUserProvidedUrl(url) {
		if (url == null) return;
		try {
			const base = globalThis.location?.href;
			return new URL(url, base).href;
		} catch {
			throw new Error(`Configuration: Could not parse user-provided export URL: '${url}'`);
		}
	}
	/**
	* @param userProvidedConfiguration  Configuration options provided by the user in code.
	* @param fallbackConfiguration Fallback to use when the {@link userProvidedConfiguration} does not specify an option.
	* @param defaultConfiguration The defaults as defined by the exporter specification
	*/
	function mergeOtlpHttpConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration) {
		return {
			...mergeOtlpSharedConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration),
			headers: mergeHeaders(userProvidedConfiguration.headers, fallbackConfiguration.headers, defaultConfiguration.headers),
			url: validateUserProvidedUrl(userProvidedConfiguration.url) ?? fallbackConfiguration.url ?? defaultConfiguration.url
		};
	}
	function getHttpConfigurationDefaults(requiredHeaders, signalResourcePath) {
		return {
			...getSharedConfigurationDefaults(),
			headers: async () => requiredHeaders,
			url: "http://localhost:4318/" + signalResourcePath
		};
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/convert-legacy-http-options.js
	function convertLegacyHeaders(config) {
		if (typeof config.headers === "function") return config.headers;
		return wrapStaticHeadersInFunction(config.headers);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/convert-legacy-browser-http-options.js
	/**
	* @deprecated this will be removed in 2.0
	*
	* @param config
	* @param signalResourcePath
	* @param requiredHeaders
	*/
	function convertLegacyBrowserHttpOptions(config, signalResourcePath, requiredHeaders) {
		return mergeOtlpHttpConfigurationWithDefaults({
			url: config.url,
			timeoutMillis: config.timeoutMillis,
			headers: convertLegacyHeaders(config),
			concurrencyLimit: config.concurrencyLimit
		}, {}, getHttpConfigurationDefaults(requiredHeaders, signalResourcePath));
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/create-legacy-browser-delegate.js
	/**
	* @deprecated
	* @param config
	* @param serializer
	* @param signalResourcePath
	* @param requiredHeaders
	*/
	function createLegacyOtlpBrowserExportDelegate(config, serializer, signalResourcePath, requiredHeaders) {
		return createOtlpFetchExportDelegate(convertLegacyBrowserHttpOptions(config, signalResourcePath, requiredHeaders), serializer);
	}
	//#endregion
	//#region ../../../node_modules/@opentelemetry/exporter-trace-otlp-http/build/esm/platform/browser/OTLPTraceExporter.js
	/**
	* Collector Trace Exporter for Web
	*/
	var OTLPTraceExporter = class extends OTLPExporterBase {
		constructor(config = {}) {
			super(createLegacyOtlpBrowserExportDelegate(config, JsonTraceSerializer, "v1/traces", { "Content-Type": "application/json" }));
		}
	};
	//#endregion
	//#region src/observability/telemetry.ts
	var tracer;
	function setupTelemetry(runtimeConfig) {
		const exporter = new OTLPTraceExporter({ url: `${runtimeConfig.collectorEndpoint}/v1/traces` });
		new WebTracerProvider({
			resource: resourceFromAttributes({
				"service.name": runtimeConfig.serviceName,
				"service.version": "1.0.0"
			}),
			spanProcessors: [new BatchSpanProcessor(exporter)]
		}).register();
		tracer = trace.getTracer("reactedge-runtime");
	}
	function getTracer() {
		return tracer;
	}
	//#endregion
	//#region src/observability/index.ts
	function startObservability(observabilityConfig) {
		setupTelemetry(observabilityConfig);
		window.addEventListener("reactedge:activity", (event) => {
			const payload = event.detail;
			const span = getTracer().startSpan(`widget.${payload.widget}.${payload.phase}`);
			span.setAttributes({
				"reactedge.widget": payload.widget,
				"reactedge.instance": payload.instance,
				"reactedge.phase": payload.phase,
				"reactedge.level": payload.level,
				"reactedge.message": payload.message
			});
			span.end();
		});
	}
	var instances = /* @__PURE__ */ new WeakMap();
	function registerInstance(element, context) {
		instances.set(element, context);
	}
	//#endregion
	//#region src/mount.ts
	var registryCache = null;
	var activity = new WidgetActivity("runtime");
	function getRegistry() {
		if (registryCache) return registryCache;
		const el = document.getElementById("reactedge-registry");
		if (!el) throw new Error("Missing registry");
		registryCache = JSON.parse(el.textContent ?? "{}");
		return registryCache;
	}
	var loaded = /* @__PURE__ */ new Map();
	async function loadScript(name) {
		const existing = loaded.get(name);
		if (existing) return existing;
		const entry = getRegistry()[name];
		await new Promise((resolve, reject) => {
			const s = document.createElement("script");
			s.src = entry.src;
			s.type = "module";
			s.async = true;
			if (entry.integrity) {
				s.integrity = "sha256-" + entry.integrity;
				s.crossOrigin = "anonymous";
			}
			s.onload = resolve;
			s.onerror = reject;
			document.head.appendChild(s);
		});
		const mod = await resolveGlobal(name);
		loaded.set(name, mod);
		return mod;
	}
	function getInstanceKey(el) {
		const tag = el.tagName.toLowerCase().replace("-widget", "");
		return el.dataset.instance || tag;
	}
	function getResolvedEntry(el) {
		const registry = getRegistry();
		const instanceKey = getInstanceKey(el);
		const tagType = el.tagName.toLowerCase().replace("-widget", "");
		const entry = registry[instanceKey];
		if (!entry) throw new Error(`No config for instance "${instanceKey}"`);
		return {
			type: tagType,
			entry
		};
	}
	async function resolveGlobal(name, retries = 10) {
		const key = `ReactEdge_${name}`;
		for (let i = 0; i < retries; i++) {
			const mod = window[key];
			if (mod) return mod;
			await new Promise((r) => setTimeout(r, 10));
		}
		throw new Error(`Global ${key} not found after load`);
	}
	function shouldMountWidgets() {
		if (new URLSearchParams(window.location.search).get("reactedge_mount") === "0") return false;
		return true;
	}
	function getDebugMode() {
		const value = new URLSearchParams(window.location.search).get("reactedge_debug");
		switch (value) {
			case "runtime":
			case "eager": return value;
			default: return null;
		}
	}
	async function mountWidget(el) {
		const { type, entry } = getResolvedEntry(el);
		const mod = await loadScript(type);
		if (mod?.mount) {
			const bootstrap = getBootstrap(el);
			const runtimeConfig = buildRuntimeConfig();
			if (getDebugMode() === "runtime") activity.group(`Runtime ${type}`, {
				element: el,
				registry: entry,
				contract: entry.contract,
				runtime: runtimeConfig,
				runtimeNode: document.getElementById("reactedge-runtime")
			});
			if (!shouldMountWidgets()) {
				activity.log(entry.widget, "[ReactEdge] CSR mount skipped", {
					widget: entry.widget,
					instance: entry.id
				});
				return;
			}
			if (entry.contract !== null) {
				const contract = entry.contract ? stripMeta(entry.contract) : null;
				mod.mount(el, contract, bootstrap, runtimeConfig);
			} else mod.mount(el, null, bootstrap, runtimeConfig);
		}
	}
	function getWidgetType(el) {
		const tag = el.tagName.toLowerCase();
		if (!tag.endsWith("-widget")) return null;
		return tag.slice(0, -7);
	}
	function getBootstrap(host) {
		const element = host.querySelector(":scope > script[data-reactedge-bootstrap]");
		if (!element?.textContent) return;
		try {
			return JSON.parse(element.textContent);
		} catch (error) {
			activity.log("bootstrap", "Invalid ReactEdge bootstrap data", { error });
			return;
		}
	}
	function scheduleWidgets() {
		const widgets = document.querySelectorAll("[data-load]");
		const debugMode = getDebugMode();
		widgets.forEach((el) => {
			const name = getWidgetType(el);
			if (name === null) return;
			const instance = el.dataset.instance;
			registerInstance(el, {
				widget: name,
				instance: instance ?? name
			});
			const mode = el.dataset.load ?? "lazy";
			if (debugMode === "eager" && mode !== "ssr") {
				mountWidget(el);
				return;
			}
			if (mode === "ssr") return;
			if (mode === "critical") {
				try {
					mountWidget(el);
				} catch (e) {
					if (e instanceof Error) activity.log("Mount on critical mode", e.message);
				}
				return;
			}
			if (mode === "eager") {
				onReady(() => {
					try {
						mountWidget(el);
					} catch (e) {
						if (e instanceof Error) activity.log("Mount onReady event", e.message);
					}
				});
				return;
			}
			if (isOnScrollMode(mode)) {
				scheduleOnScroll(el, mode);
				return;
			}
			scheduleOnVisible(el);
		});
	}
	function scheduleOnVisible(el) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					mountWidget(el);
					observer.unobserve(el);
				}
			});
		}, { rootMargin: "200px" });
		observer.observe(el);
	}
	function onReady(cb) {
		if (document.readyState === "interactive" || document.readyState === "complete") queueMicrotask(cb);
		else document.addEventListener("DOMContentLoaded", cb);
	}
	function scheduleOnScroll(el, mode) {
		const match = mode.match(/^on-scroll:(\d+)$/);
		if (!match) return;
		const threshold = Number(match[1]);
		const onScroll = () => {
			if (window.scrollY >= threshold) {
				mountWidget(el);
				window.removeEventListener("scroll", onScroll);
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });
	}
	function isOnScrollMode(mode) {
		return mode.startsWith("on-scroll:");
	}
	function boot() {
		const runtimeConfig = buildRuntimeConfig();
		if (runtimeConfig?.observability) startObservability(runtimeConfig.observability);
		scheduleWidgets();
	}
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
	else queueMicrotask(boot);
	//#endregion
	exports.boot = boot;
	exports.mountWidget = mountWidget;
	exports.scheduleWidgets = scheduleWidgets;
	return exports;
})({});

//# sourceMappingURL=reactedge-loader.js.map