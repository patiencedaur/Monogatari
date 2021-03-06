import { $_, Util } from '@aegis-framework/artemis';

/**
 * A component represents an object or content in the game such as screens, menus
 * and all other visual or structural elements.
 *
 * The life cycle of an component follows the Mounting cycle for actions.
 *
 * The mounting cycle has 3 steps:
 *
 * 1. Setup - Here the action needs to set up everything it will need for working
 *            generally, in this section a component will generally add its HTML
 *            content to the global Monogatari object and will set up any needed
 *            configuration or state variables.
 *
 * 2. Bind - Once the component has been setup, its time to bind all the necessary
 *           event listeners or perform more operations on the DOM once all elements
 *           have been setup. Components will generally bind all the listeners needed
 *           for their inner elements to work correctly.
 *
 * 3. Init - Finally, once the component was setup and it performed all the needed
 *           bindings, it may start performing its operations and perform all
 *          further needed operations.
 *
 * @class Component
 */
class Component extends HTMLElement {


	static _registered = false;

	static _priority = 0;

	//static _children = [];

	static _explicitPropTypes = ['boolean', 'string', 'number'];

	static _template = null;

	/**
	 * Each component can define its initial HTML structure, which should be used on
	 * the setup or rendering functions of the cycle, adding to the DOM.
	*/
	static _html = '';

	/**
	 * If needed, every component should declare its configuration as follows. This
	 * configuration object should be used to store component-specific settings as well
	 * as other objects/assets used by the component. If any specific object needs
	 * recurrent access such as the declarations in the script.js file, providing
	 * a static function for that specific object could be great.
	 */
	static _configuration = {};

	/**
	 * @static configuration - A simple function providing access to the configuration
	 * object of the function. If the component has a configuration object it must
	 * also include this method.
	 *
	 * @param  {Object|string} [object = null] - Object with which current
	 * configuration will be updated with (i.e. Object.assign) or a string to access
	 * a property.
	 *
	 * @return {any} - If the parameter sent was a string, the function will
	 * return the value of the property whose name matches the parameter. If no
	 * parameter was sent, then the function will return the whole configuration
	 * object.
	 */
	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration[object];
			} else {
				this._configuration = Object.assign ({}, this._configuration, object);
				this.onConfigurationUpdate ().then (() => {
					this.onUpdate ();
				});
			}
		} else {
			return this._configuration;
		}
	}

	static all () {
		return $_(this._id);
	}

	static get (id) {
		return $_(`${this._id} [data-instance="${id}"]`);
	}

	/**
	 * @static onStart - This function acts as an event listener for when the game
	 * starts. If the component needs to do any particular activities when the game
	 * starts, then this function should be implemented and it will be automatically
	 * called once the player starts the game.
	 *
	 * @return {Promise}
	 */
	static onStart () {
		return Promise.resolve ();
	}

	/**
	 * @static onLoad - This function acts as an event listener for when a game
	 * is loaded. If the component needs to perform any particular actions such as
	 * restoring some state (i.e. showing images, playing media, etc.) when a game
	 * is loaded, this function must be implemented and it will be automatically
	 * called when a game is loaded.
	 *
	 * @return {Promise}  description
	 */
	static onLoad () {
		return Promise.resolve ();
	}

	/**
	 * @static setup - The setup is the first step of the Mounting cycle, all
	 * operations required for the component's setup should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the setup operation
	 */
	static setup () {
		const template = document.getElementById (this._id);

		if (template !== null) {
			this.template (template.innerHTML);
		}

		return Promise.resolve ();
	}

	static template (html = null, context = null) {
		if (html !== null) {
			this._template = html;
			this.instances ((instance) => {
				if (instance._isReady) {
					instance.forceRender ();
				}
			});
		} else {

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof this._template === 'function') {
				return this._template.call (context);
			}

			// If this is reached, the HTML was just a string
			return this._template;
		}
	}

	/**
	 * @static shouldProceed - Either when the user clicks in the game to proceed or
	 * the autoPlay feature is ready to go on, Monogatari will first check with
	 * all actions if it's ok to proceed. Every action should implement its own
	 * logic for it according to its requirements.
	 *
	 * @return {Promise} - Resolved if proceeding is alright or rejected if its not
	 */
	static shouldProceed () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.shouldProceed ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static willProceed - Once the shouldProceed check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game proceeding.
	 *
	 * @return {Promise}
	 */
	static willProceed () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.willProceed ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static shouldRollback - Similarly to the shouldProceed () function, this one takes
	 * action when the player tries to go back in the game.Monogatari will first
	 * check with all actions if it's ok to go back. Every action should implement
	 * its own logic for it according to its requirements.
	 *
	 * @return {Promise} - Resolved if going back is alright or rejected if its not
	 */
	static shouldRollback () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.shouldRollback ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static willRollback - Once the shouldRollback check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game reverting the previous action
	 *
	 * @return {Promise}
	 */
	static willRollback () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.willRollback ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static bind - The binding is the second step of the Mounting cycle, all
	 * operations related to event bindings or other sort of binding with the
	 * HTML content generated in the setup phase should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the binding operation
	 */
	static bind () {
		return Promise.resolve ();
	}

	/**
	 * @static init - The initialization is the last step of the Mounting cycle,
	 * all final operations should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the initialization operation
	 */
	static init () {
		return Promise.resolve ();
	}

	/**
	 * @static onConfigurationUpdate - Every time the configuration object is
	 * changed through the configuration () method, this function will be called.
	 * Ideal for components that need to update their UI or other things when their
	 * configuration is changed.
	 *
	 * @return {Promise} - Result of the onConfigurationUpdate operation.
	 */
	static onConfigurationUpdate () {
		return Promise.resolve ();
	}

	/**
	 * @static onSave - This function acts as an event listener for when a game
	 * is saved. If the component needs to perform any particular actions when that
	 * happens, this function must be implemented and it will be automatically
	 * called when a game is saved.
	 *
	 * @param {Object} slot - The slot object that has just been saved.
	 * @param {string} slot.key - The key used to save the slot in the local storage
	 * @param {Object} slot.value - The actual value saved
	 *
	 * @return {Promise}  description
	 */
	static onSave () {
		return Promise.resolve ();
	}

	/**
	 * @static reset - When a game ends using the 'end' statement or before a game
	 * is loaded, Monogatari will perform a reset on all its components. If the component
	 * needs to reset a state or any other variables/elements to an initial state
	 * once a game is over or a new one is loaded, the logic for it must be implemented
	 * here and the function will be automatically called when needed.
	 *
	 * @return {Promise} - Result of the reset operation
	 */
	static onReset () {
		const promises = [];

		this.instances ((instance) => {
			promises.push (instance.onReset ());
		});

		return Promise.all (promises);
	}


	onReset () {
		return Promise.resolve ();
	}

	/**
	 * @static element - Returns this component's element as an Artemis DOM
	 * instance, using the result of the `selector ()` function as the selector
	 *
	 * @returns {DOM} - Artemis DOM instance
	 */
	element () {
		return $_(this);
	}

	remove () {
		this.parentNode.removeChild (this);
	}

	instanceSelector () {
		return $_(`${this.constructor._id}[data-${this.constructor.name.toLowerCase ()}`);
	}

	static instances (callback = null) {
		if (typeof callback === 'function') {
			return $_(this._id).each (callback);
		}
		return $_(this._id);
	}

	// static instance (id) {

	// }

	instance (id) {
		return $_(`${this.constructor._id}[data-${this.constructor.name.toLowerCase ()}="${id}"`);
	}

	/**
	 * @static content - Attempts to find a content element inside of this
	 * component or its children
	 *
	 * @param {string} name - Name of the content element to find
	 *
	 * @returns {DOM} - An Artemis DOM instance with the found elements
	 */
	content (name) {
		return this.element ().find (`[data-content="${name}"]`);
	}

	parent (component) {
		if (typeof component !== 'undefined') {
			this._parent = component;
		} else {
			return this._parent;
		}
	}

	static register () {
		window.customElements.define (this._id, this);
		this._registered = true;
	}

	static instantiate (props) {
		if (this._registered === false) {
			this.register ();
		}

		const element = document.createElement (this._id);
		element._setProps (props);

		return element;
	}

	constructor () {
		super ();

		this._state = {};
		this._props = {};
		this._ready = [];

		this._connected = false;
		this._isReady = false;

	}

	/**
	 * width - Determines the real (computed) width of the element
	 *
	 * @return {int} - Computed Width of the element on pixels
	 */
	get width () {
		return parseInt (getComputedStyle(this).width.replace ('px', ''));
	}

	set width (value) {
		this.style.width = value;
	}

	/**
	 * height - Determines the real (computed) height of the element
	 *
	 * @return {int} - Computed height of the element on pixels
	 */
	get height () {
		return parseInt (getComputedStyle(this).height.replace ('px', ''));
	}

	set height (value) {
		this.style.height = value;
	}

	get engine () {
		return this.constructor.engine;
	}

	set engine (value) {
		throw new Error ('Component engine reference is hold at static level and cannot be modified.');
	}

	get static () {
		return new Proxy (this.constructor, {});
	}

	set static (value) {
		throw new Error ('Component static property cannot be reassigned.');
	}

	get props () {
		return new Proxy (this, {
			get: (target, key) => {
				if (this.hasAttribute (key)) {
					return this.getAttribute (key);
				} else if (key in this._props) {
					return this._props[key];
				}
				return null;
			},
			set: (target, key, value) => {
				throw new Error ('Component props should be set using the `setProps` function.');
			}
		});
	}

	set props (value) {
		if (this._connected === false) {
			this._props = Object.assign ({}, this._props, value);
		} else {
			throw new Error ('Component props cannot be directly assigned. Use the `setProps` function instead.');
		}
	}

	get state () {
		return new Proxy (this._state, {
			get: (target, key) => {
				return target[key];
			},
			set: (target, key, value) => {
				if (this._connected === false) {
					return target[key] = value;
				} else {
					throw new Error ('Component state should be set using the `setState`.');
				}

			}
		});
	}

	set state (value) {
		if (this._connected === false) {
			this._state = Object.assign ({}, this._state, value);
		} else {
			throw new Error ('Component state should be set using the `setState` function.');
		}
	}

	/**
	 * @static template - A simple function providing access to the basic HTML
	 * structure of the component.
	 *
	 * @param {function|string} html - A string or function that renders the
	 * component into a valid HTML structure.
	 * @param {*} params - Any additional params that should be used when calling
	 * the rendering function
	 *
	 * @returns {void|string} - Void or the HTML structure in a string
	 */
	template (html = null) {
		return this.constructor.template (html, this);
	}

	shouldProceed () {
		return Promise.resolve ();
	}

	willProceed () {
		return Promise.resolve ();
	}

	shouldRollback () {
		return Promise.resolve ();
	}

	willRollback () {
		return Promise.resolve ();
	}

	setState (state) {
		if (typeof state === 'object') {
			const oldState = Object.assign ({}, this._state);

			this._state = Object.assign ({}, this._state, state);

			for (const key of Object.keys (state)) {
				this.updateCallback (key, oldState[key], this._state[key], 'state', oldState, this._state);
			}
		}
	}

	setProps (props) {
		if (typeof props === 'object') {
			const oldProps = Object.assign ({}, this._props);

			this._props = Object.assign ({}, this._props, props);

			for (const key of Object.keys (props)) {
				this.updateCallback (key, oldProps[key], this._props[key], 'props', oldProps, this._props);
			}
			this._setPropAttributes ();
		}
	}

	_setPropAttributes () {
		for (const key of Object.keys (this.props)) {
			const value = this.props[key];

			if (this.static._explicitPropTypes.indexOf (typeof value) > -1) {
				this.setAttribute (key, this.props[key]);
			}
		}
	}

	willUpdate (origin, property, oldValue, newValue, oldObject, newObject) {
		return Promise.resolve ();
	}

	update (origin, property, oldValue, newValue, oldObject, newObject) {
		return Promise.resolve ();
	}

	didUpdate (origin, property, oldValue, newValue, oldObject, newObject) {
		return Promise.resolve ();
	}

	onStateUpdate (property, oldValue, newValue, oldObject, newObject) {
		return Promise.resolve ();
	}

	onPropsUpdate (property, oldValue, newValue, oldObject, newObject) {
		return Promise.resolve ();
	}

	willMount () {
		return Promise.resolve ();
	}

	didMount () {
		return Promise.resolve ();
	}

	willUnmount () {
		return Promise.resolve ();
	}

	unmount () {
		return Promise.resolve ();
	}

	didUnmount () {
		return Promise.resolve ();
	}

	forceRender () {
		return this._render ();
	}

	render () {
		return '';
	}

	_render () {
		let render = this.render;

		if (this.constructor._template !== null) {
			render = this.template;
		}

		return Util.callAsync (render, this).then ((html) => {
			this.innerHTML = html;
		});
	}

	connectedCallback () {
		this._connected = true;
		this.dataset.component = this.static._id;
		this.classList.add ('animated');

		this._setPropAttributes ();

		return this.willMount ().then (() => {
			return this._render ().then (() => {
				return this.didMount ().then (() => {
					this._isReady = true;
					for (const callback of this._ready) {
						callback.call (this);
					}
				});
			});
		});
	}

	ready (callback) {
		this._ready.push (callback);
	}

	disconnectedCallback () {
		return this.willUnmount ().then (() => {
			return this.unmount ().then (() => {
				return this.didUnmount ();
			});
		});
	}

	updateCallback (property, oldValue, newValue, origin = 'props', oldObject = {}, newObject = {}) {
		return this.willUpdate (origin, property, oldValue, newValue, oldObject, newObject).then (() => {
			return this.update (origin, property, oldValue, newValue, oldObject, newObject).then (() => {
				let promise;
				if (origin === 'state') {
					promise = this.onStateUpdate (property, oldValue, newValue, oldObject, newObject);
				} else {
					promise = this.onPropsUpdate (property, oldValue, newValue, oldObject, newObject);
				}
				return promise.then (() => {
					return this.didUpdate (origin, property, oldValue, newValue, oldObject, newObject);
				});
			});
		}).catch ((e) => {
			console.error (e);
			// Component should not update
		});
	}

	attributeChangedCallback (property, oldValue, newValue) {

	}
}

export default Component;