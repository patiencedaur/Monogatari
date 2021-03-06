import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { Text } from '@aegis-framework/artemis';

export class Scene extends Action {

	static setup () {
		Monogatari.history ('scene');
		Monogatari.history ('sceneElements');
		Monogatari.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { scene } = Monogatari.state ();
		if (scene !== '') {
			Monogatari.run (scene, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('scene').pop ();
		}
		return Promise.resolve ();
	}

	static reset () {
		Monogatari.element ().find ('[data-ui="background"]').style ('background-image', 'initial');
		Monogatari.element ().find ('[data-ui="background"]').style ('background-color', 'initial');
		Monogatari.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'scene';
	}

	constructor ([ show, type, scene, ...classes ]) {
		super ();
		this.scene = scene;
		this.property = 'background-image';
		if (typeof Monogatari.asset ('scenes', scene) !== 'undefined') {
			this.value = `url(${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').scenes}/${Monogatari.asset ('scenes', scene)})`;
		} else {
			const rest = [scene, ...classes].join (' ');
			if (classes.indexOf ('with') > -1) {
				this.value = Text.prefix ('with', rest);
			} else {
				this.value = rest;
			}

			const isColorProperty = ['#', 'rgb', 'hsl'].findIndex ((color) => {
				return this.value.indexOf (color) === 0;
			}) > -1;

			const isNamed = this.value.indexOf (' ') > -1 ? false : new RegExp('\w+').test (this.value);

			if (isColorProperty === true || isNamed === true) {
				this.property = 'background-color';
			}
		}

		if (typeof classes !== 'undefined') {
			this.classes = ['animated', ...classes];
		} else {
			this.classes = [];
		}
	}

	willApply () {
		const scene_elements = [];
		Monogatari.element ().find ('[data-screen="game"] img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
			scene_elements.push (element.outerHTML);
		});

		Monogatari.history ('sceneElements').push (scene_elements);

		Monogatari.element ().find ('[data-character]').remove ();
		Monogatari.element ().find ('[data-image]').remove ();
		Monogatari.element ().find ('[data-ui="background"]').removeClass ();
		void Monogatari.element ().find ('[data-ui="background"]').get (0).offsetWidth;
		return Promise.resolve ();
	}

	apply () {
		Monogatari.element ().find ('[data-ui="background"]').style ('background-image', 'initial');
		Monogatari.element ().find ('[data-ui="background"]').style ('background-color', 'initial');
		Monogatari.element ().find ('[data-ui="background"]').style ('animation-duration', '');
		Monogatari.element ().find ('[data-ui="background"]').style (this.property, this.value);

		const durationPosition = this.classes.indexOf ('duration');

		if (durationPosition > -1) {
			Monogatari.element ().find ('[data-ui="background"]').style ('animation-duration', this.classes[durationPosition + 1]);
		}

		for (const newClass of this.classes) {
			Monogatari.element ().find ('[data-ui="background"]').addClass (newClass);
		}

		return Promise.resolve ();
	}

	didApply () {
		Monogatari.state ({
			scene: this._statement
		});
		Monogatari.history ('scene').push (this._statement);

		Monogatari.action ('Dialog').reset ();
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		Monogatari.element ().find ('[data-character]').remove ();
		Monogatari.element ().find ('[data-image]').remove ();
		Monogatari.element ().find ('[data-ui="background"]').removeClass ();
		return Promise.resolve ();
	}

	revert () {
		Monogatari.history ('scene').pop ();

		if (Monogatari.history ('scene').length > 0) {
			const last = Monogatari.history ('scene')[Monogatari.history ('scene').length - 1];
			this.constructor (last.split (' '));

			Monogatari.element ().find ('[data-ui="background"]').style ('background-image', 'initial');
			Monogatari.element ().find ('[data-ui="background"]').style ('background-color', 'initial');
			Monogatari.element ().find ('[data-ui="background"]').style (this.property, this.value);

			for (const newClass of this.classes) {
				Monogatari.element ().find ('[data-ui="background"]').addClass (newClass);
			}

			Monogatari.state ({
				scene: last
			});

			if (Monogatari.history ('sceneElements').length > 0) {
				const scene_elements = Monogatari.history  ('sceneElements').pop ();

				if (typeof scene_elements === 'object') {
					for (const element of scene_elements) {
						Monogatari.element ().find ('[data-screen="game"]').append (element);
					}
				}
			}
			Monogatari.action ('Dialog').reset ();
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Scene.id = 'Scene';

Monogatari.registerAction (Scene);