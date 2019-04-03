import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class CreditsScreenItem extends Component {

	static render (section, content) {
		return this.html (null, section, content);
	}
}

CreditsScreenItem._id = 'credits_screen::item';

CreditsScreenItem._html = (section, content) => {
	let html = `<h3>${section}</h3><div>`;

	if (typeof content === 'string') {
		return `
			<p class='row row--spaced'>
				<span class="row__column row__column--phone--12">${content}</span>
			</p>`;
	}

	for (const key of Object.keys (content)) {
		if (key.indexOf ('_') === 0) {
			html += `<p class='row row--spaced'>
						<span class="row__column row__column--phone--12">${content[key]}</span>
					</p>`;
		} else {
			html += `<p class='row row--spaced'>
						<b class="row__column row__column--phone--6">${key}</b>
						<span class="row__column row__column--phone--6">${content[key]}</span>
					</p>`;
		}

	}
	html += '</div>';
	return html;
};

Monogatari.registerComponent (CreditsScreenItem);