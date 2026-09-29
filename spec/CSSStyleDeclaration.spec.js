describe('CSSOM', function() {
describe('CSSStyleDeclaration', function() {

	it('setProperty, removeProperty, cssText, getPropertyValue, getPropertyPriority', function() {
		var d = new CSSOM.CSSStyleDeclaration;

		d.setProperty('color', 'purple');
		expect(d).toEqualOwnProperties({
			0: 'color',
			length: 1,
			parentRule: null,
			color: 'purple',
			_importants: {
				color: undefined
			}
		});

		d.setProperty('width', '128px', 'important');
		expect(d).toEqualOwnProperties({
			0: 'color',
			1: 'width',
			length: 2,
			parentRule: null,
			color: 'purple',
			width: '128px',
			_importants: {
				color: undefined,
				width: 'important'
			}
		});

		d.setProperty('opacity', 0);

		expect(d.cssText).toBe('color: purple; width: 128px !important; opacity: 0;');

		expect(d.getPropertyValue('color')).toBe('purple');
		expect(d.getPropertyValue('width')).toBe('128px');
		expect(d.getPropertyValue('opacity')).toBe('0');
		expect(d.getPropertyValue('position')).toBe('');

		expect(d.getPropertyPriority('color')).toBe('');
		expect(d.getPropertyPriority('width')).toBe('important');
		expect(d.getPropertyPriority('position')).toBe('');

		d.setProperty('color', 'green');
		d.removeProperty('width');
		d.removeProperty('opacity');

		expect(d.cssText).toBe('color: green;');
	});

	given('color: pink; outline: 2px solid red;', function(cssText) {
		var d = new CSSOM.CSSStyleDeclaration;
		d.cssText = cssText;
		expect(d.cssText).toBe(cssText);
	});

	it('setProperty ignores a declaration named "length" instead of overwriting the declaration count', function() {
		var d = new CSSOM.CSSStyleDeclaration;

		d.setProperty('length', '2000000000');
		expect(d.length).toBe(0);
		expect(d[0]).toBeUndefined();
		expect(d.cssText).toBe('');

		d.setProperty('color', 'red');
		d.setProperty('length', 5);
		expect(d.length).toBe(1);
		expect(d[1]).toBeUndefined();
		expect(d.cssText).toBe('color: red;');
	});

	it('parse keeps the declaration count intact for a{length:2000000000}', function() {
		var rule = CSSOM.parse('a{length:2000000000}').cssRules[0];
		expect(rule.style.length).toBe(0);
		expect(rule.style.cssText).toBe('');
		expect(rule.cssText).toBe('a {}');

		rule = CSSOM.parse('a{color: red; length: 2000000000; width: 1px}').cssRules[0];
		expect(rule.style.length).toBe(2);
		expect(rule.style.cssText).toBe('color: red; width: 1px;');
	});

	it('cssText setters ignore a declaration named "length"', function() {
		var d = new CSSOM.CSSStyleDeclaration;
		d.cssText = 'length: 2000000000; color: red';
		expect(d.length).toBe(1);
		expect(d.cssText).toBe('color: red;');

		var rule = new CSSOM.CSSStyleRule;
		rule.cssText = 'a{length:2000000000}';
		expect(rule.style.length).toBe(0);
		expect(rule.cssText).toBe('a {}');
	});

	it('declarations cannot overwrite parentRule or _importants', function() {
		var rule = CSSOM.parse('a{parentRule: x; _importants: y; color: red !important}').cssRules[0];
		expect(rule.style.parentRule).toBe(rule);
		expect(rule.style.length).toBe(1);
		expect(rule.style.getPropertyPriority('color')).toBe('important');
		expect(rule.style.cssText).toBe('color: red !important;');
	});

	it('declarations cannot shadow CSSStyleDeclaration methods or accessors', function() {
		var style;
		expect(function() {
			style = CSSOM.parse('a{setProperty: x; getPropertyValue: y; cssText: z; constructor: w; __proto__: v; color: red}').cssRules[0].style;
		}).not.toThrow();
		expect(style.length).toBe(1);
		expect(style.setProperty).toBe(CSSOM.CSSStyleDeclaration.prototype.setProperty);
		expect(style.getPropertyValue).toBe(CSSOM.CSSStyleDeclaration.prototype.getPropertyValue);
		expect(style.constructor).toBe(CSSOM.CSSStyleDeclaration);
		expect(style.cssText).toBe('color: red;');
	});

});
});
