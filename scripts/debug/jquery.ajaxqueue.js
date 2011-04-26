/**
 * Created by .
 * User: Dmytro
 * Date: 25.04.11
 * Time: 13:06
 * To change this template use File | Settings | File Templates.
 */
(function($) {
  // jQuery on an empty object, we are going to use this as our Queue
  var ajaxQueue = $({});

  $.ajaxQueue = function(ajaxOpts) {
    // hold the original complete function
    var oldComplete = ajaxOpts.complete;

    // queue our ajax request
    ajaxQueue.queue(function(next) {

      // create a complete callback to fire the next event in the queue
      ajaxOpts.complete = function() {
        // fire the original complete if it was there
        if (oldComplete) oldComplete.apply(this, arguments);
        //debugger;
        next(); // run the next query in the queue
      };
      // run the query
      $.ajax(ajaxOpts);
    });
  };
})(jQuery);

