/* global describe, it */

//(function () { Commented it as it needs some hack to test with anonymous functions
  'use strict';

    describe("ShowHideText", function() {

        it("toggle()", function() {
            var toggleText = new ShowHideText();

            spyOn(toggleText, 'toggleStatus');
            spyOn(toggleText, 'setButtonText');
            spyOn(toggleText, 'runToggleFunction');

            toggleText.toggle();

            expect(toggleText.toggleStatus).toHaveBeenCalled();
            expect(toggleText.setButtonText).toHaveBeenCalled();
            expect(toggleText.runToggleFunction).toHaveBeenCalled();
        });

        describe('runToggleFunction()', function() {
            it('callback provided', function() {
                var func = jasmine.createSpy('func');
                var toggleText = new ShowHideText({onToggle: func});
                var status = 1;

                toggleText._status = status;
                toggleText.runToggleFunction();

                expect(func).toHaveBeenCalledWith(status);
            });

            it('no callback', function() {
                var func = jasmine.createSpy('func');
                var toggleText = new ShowHideText({onToggle: func});

                try {
                    toggleText.runToggleFunction();
                    expect(true).toBe(true);
                } catch (e) {
                    expect(true).toBe(false);
                }
            });
        });

        it('toggleStatus()', function() {
            var toggleText = new ShowHideText();

            toggleText._status = 1;
            toggleText.toggleStatus();

            expect(toggleText._status).toBe(0);
        });

    });
//})();
