;(function ($, ko) {

    var unwrap = ko.utils.unwrapObservable;

    ko.bindingHandlers['progressBar'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $elem = $(element)
              , progress = ko.unwrap(valueAccessor());
            progress = progress || 0
            $elem.addClass('progress-bar');
            $elem.attr('role', 'progressbar');
            $elem.attr('aria-valuemin', '0');
            $elem.attr('aria-valuemax', '100');
            $elem.attr('aria-valuenow', progress);
            $elem.css('width', progress + '%');
            $elem.append('<span class="sr-only">' + progress+ '% Completado</span>');

        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var progressBarOptions = allBindingsAccessor().progressBarOptions || {}
              , progress = ko.unwrap(valueAccessor())
              , $elem = $(element);
            progress = progress || 0
            $elem.attr('aria-valuenow', progress);
            $elem.css('width', progress + '%');

        }
    };

})(jQuery, ko)
