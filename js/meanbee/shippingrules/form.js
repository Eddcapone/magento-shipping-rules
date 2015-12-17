(function() {
  /**
   * Non-conflicting forEach polyfill.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Polyfill}
   */
  function forEach(array, cb, cxt) {
    var T, k, O, len;
    if (array == null) throw new TypeError(' array is null or not defined'); // jshint ignore:line
    O = Object(array);
    len = O.length >>> 0;
    if (typeof cb !== 'function') throw new TypeError(cb + ' is not a function');
    if (arguments.length > 1) T = cxt;
    for (k = 0; k < len; k++) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        cb.call(T, kValue, k, O);
      }
    }
  }

  var postalCodeData,
      scripts = document.getElementsByTagName('script'),
      jsDirectory = scripts[scripts.length - 1].src.replace(/\/[^\/]*\.js/, '/');

  /**
   * Get postal code format descriptors from JSON file.
   */
  function loadPostalCodeData() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        postalCodeData = JSON.parse(xhr.responseText);
        forEach(
          document.querySelectorAll('input[value="meanship/rule_condition_postalCode"] + .rule-param select'),
          function(postalCodeFormatSelect) {
            postalCodeFormatChangeHandler({target: postalCodeFormatSelect});
          }
        );
      }
    };

    xhr.open('GET', jsDirectory + 'postalcode_formats.json');
    xhr.send();
  }

  function getPostalCodePartsByCountryCode(countryCode) {
    for (var i = 0; i < postalCodeData.length; i++) {
      var postalCode = postalCodeData[i];
      if (postalCode.code === countryCode) {
        return postalCode.parts;
      }
    }

    return null;
  }

  /**
   * Show only the attributes that can be applied to the selected postal code format.
   */
  function postalCodeFormatChangeHandler(event) {
    var parts = getPostalCodePartsByCountryCode(event.target.value),
        container = event.target.parentElement.parentElement.parentElement;
    if (parts === null || parts === undefined) { return; }

    forEach(container.querySelectorAll('option[value^="meanship/rule_condition|dest_postal_code"]'), function(option) {
      option.style.display = 'none';
    });

    for (var i = 0; i < parts.length; i++) {
      var option = container.querySelector('option[value="meanship/rule_condition|dest_postal_code_p' + i + '_' + parts[i] + '"]');
      if (option) {
        option.style.display = 'initial';
      }
    }
  }

  // Attach event listeners.
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('conditions_fieldset').addEventListener('change', function(event) {
      if (event.target.parentElement.parentElement.previousElementSibling.value === 'meanship/rule_condition_postalCode') {
        postalCodeFormatChangeHandler(event);
      }
    });

    loadPostalCodeData();
  }, false);
}());
