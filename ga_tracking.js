function () {
  'use strict';

  console.log('GA Version v1.7.2');

  /**
   * GA Account IDs:-
   * PRODUCTION (Real transaction data): UA-6722890-1
   * PRE-DEPLOYMENT (Real transaction data): UA-55800919-1
   * STAGING (Staging only data): UA-64827939-1
   */
   (function(i, s, o, g, r, a, m) {
    i.GoogleAnalyticsObject = r;
    i[r] = i[r] || function() {(i[r].q = i[r].q || []).push(arguments);}, i[r].l = 1 * new Date();
    a = s.createElement(o), m = s.getElementsByTagName(o)[0];a.async = 1;
    a.src = g;m.parentNode.insertBefore(a, m);
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

  var uv = universal_variable,
      pgType = uv.page.type.toLowerCase(),
      $body = $('body'),
      pageGroup = 'Content/Other',
      thisUrl = window.location.href;
      isHelpPage = this.valueForToken('isHelpPage'),
      ga_tracker = this.valueForToken('ga_tracker'),
      ga_account = this.valueForToken('ga_account'),
      ga_set = ga_tracker + '.set',
      ga_send = ga_tracker + '.send',
      ga_req = ga_tracker + '.require',
      ga_ecSetAction = ga_tracker + '.ec:setAction',
      ga_ecAddProduct = ga_tracker + '.ec:addProduct',
      ga_ecAddImpression = ga_tracker + '.ec:addImpression';

  // CREATE A TRACKER & NAME IT e.g. 'testTracker'
  ga('create', ga_account, 'auto', ga_tracker);

  // ADD GA PLUGINS
  ga(ga_req, 'ec');
  ga(ga_req, 'linkid');
  ga(ga_req, 'displayfeatures');


  // PAGE SPECIFIC EXECUTION
  switch (pgType) {

    /* HOMEPAGE */
    case 'home':
      pageGroup = 'Homepage';
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
      break;

    /* SEARCH */
    case 'search':
      pageGroup = 'Search';
      ga(ga_set, 'dimension3', getPLPSort());
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
      page_plpsearch();
      break;

    /* CATEGORY */
    case 'category':
      if(thisUrl.indexOf('deliveryreturns') == -1 && thisUrl.indexOf('help-advice') == -1) {
        pageGroup = 'PLP';
        if(!$('.categorylanding').length) {
          ga(ga_set, 'dimension3', getPLPSort());
        }
        ga(ga_set, 'contentGroup2', uv.page.breadcrumb[0]);
      }
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
      if (!$('.categorylanding').length) {
        page_plpsearch();
      }
      break;

    /* PRODUCT */
    case 'product':
      pageGroup = 'PDP';
      ga(ga_set, 'contentGroup2', uv.product.category);
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
      page_product();
      break;

    /* BASKET */
    case 'basket':
      pageGroup = (thisUrl.indexOf('WorldPay-Cancel') > -1) ? 'Order Cancellation' : 'Basket';
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
      page_basket();
      break;

    /* CHECKOUT */
    case 'checkout':
      pageGroup = (thisUrl.indexOf('WorldPay-Cancel') > -1) ? 'Order Cancellation' : 'Checkout';
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
      if ( uv.page.breadcrumb == 'checkoutprogressindicator.billing') {
        page_checkout();
      }
      break;

    /* CONFIRMATION */
    case 'confirmation':
      pageGroup = 'Order Confirmation';
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
      page_orderconf();
      break;

    /* ALL OTHER PAGES */
    default:
      if ( isHelpPage ) {
        pageGroup = 'Help Pages'
      }
      if (thisUrl.indexOf('blog') > -1) {
        pageGroup = 'Blog'
      }
      ga(ga_set, 'contentGroup1', pageGroup);
      ga(ga_send, 'pageview');
  }

  //EVENTS, CUSTOM METRICS & CUSTOM DIMENSIONS
  (function(){
    // General error messages
    $('.error-message').each(function(){
      var error_str = $(this).text();
      if ($.trim(error_str).length === 0 && $(this).is(":visible")) {
        sendEvent(['Page Error', pgType, error_str, {'nonInteraction': 1}]);
      }
    });
    //Sign-up pop-up
    if (thisUrl.indexOf('email_subscribe.html?eml_fld') > -1 ) {
      sendEvent(['Login/Register', 'Pop-up Viewed', 'Newsletter Sign-up Pop-up Viewed']);
    }
    //Registration sign-up
    if (thisUrl.indexOf('registration') > -1 && uv.page.breadcrumb[0].toLowerCase() == 'my account') {
      sendEvent(['Login/Register', 'Account Registered', 'New Account Created']);
    }
  })();

  // PAGE EXECUTIONS
  function page_plpsearch() {
    var resultCount = $.trim($('.switch .count:eq(0)').text().replace(' Results', ''));
    list = getListData();
    listImpressions(list);
    $(document).ajaxComplete(function(e, x, o) {
      if (getUrlVars(o.url).sz && getUrlVars(o.url).format == 'page-element') {
        var startPoint = getUrlVars(o.url).start;
        listImpressions(list, startPoint);
      } else if (getUrlVars(o.url).indexOf('srule') > -1) {
        getPLPSort(true)
      }
    });

    quickviewProductHandler();
  }

  function page_product() {
    ga(ga_ecAddProduct, {
      'id': uv.product.sku_code,
      'name': uv.product.name,
      'category': uv.product.category
    });
    ga(ga_ecSetAction, 'detail');
    sendEvent(['Product Page', 'View', uv.product.name, {'nonInteraction': 1}]);
    $body.on('click.basket_add', '.add-to-cart', function() {
      if ($(this).prop('disabled')) return;
      var r = $(this).closest('.product-content'),
      itm = {},
      qty = 1;
      try {
        var item_name = $.trim($('.product-name', r).children().text()),
        item_id = $('input.pid', r).val(),
        item_size = $('.size-attribute', r).length ? $('.swatches .selected .selected', r).text() : uv.product.size,
        item_price = $('.product-sales-price', r).text() || uv.product.unit_sale_price;
        qty = $('.qty', r).val();
        itm.product = {
          'id': $.trim(item_id),
          'name': item_name ? item_name : uv.product.name,
          'variant': item_size ? $.trim(item_size) : 'N/A',
          'unit_sale_price': item_price,
          'category': uv.product.category
        };
      } catch (ignore) {}
      basketChange('add', itm, qty);
    });
    $body.on('click.basket_add_all', '#add-all-to-cart', function() {
      $('.product-set-list .right-inner').each(function() {
        var r = $(this),
        itm = {},
        qty = 1;
        try {
          if ($('.add-to-cart', r).length && !$('.add-to-cart', r).prop('disabled')) {
            var s = ($('.size li.selected', r).length) ? $.trim($('.size li.selected .selected', r).text()) : '',
            item_name = $('.item-name', r),
            item_id = item_name.prop('href');
            item_id = item_id.substring(item_id.lastIndexOf('/') + 1, item_id.lastIndexOf('.'));
            qty = $('.qty', r).val();
            itm.product = {
              'id': $.trim(item_id),
              'name': $.trim(item_name.text()),
              'variant': s,
              'unit_sale_price': $('.product-sales-price', r).text()
            };
            basketChange('add', itm, qty);
          }
        } catch (ignore) {}
      });
    });
  }

  function page_basket() {
    addProducts(uv.basket.line_items);
    gaCheckoutStep(1);
    sendEvent(['Basket Page', 'Checkout', 'Basket Viewed', {'nonInteraction': 1}]);

    // Listen for product changes
    basketProductHandler();

    $('[name="dwfrm_cart_checkoutCart"]').one('click.ga_checkout', function() {
      //Update shipping method
      gaCheckoutOption(1,uv.basket.shipping_method);
      sendEvent(['Basket Page', 'Checkout', 'Card Payment']);
    });

    $('[name="dwfrm_cart_expressCheckout"]').one('click.ga_checkout', function() {
      //Update shipping method
      gaCheckoutOption(1,uv.basket.shipping_method);

      addProducts(uv.basket.line_items);
      gaCheckoutStep(2);

      addProducts(uv.basket.line_items);
      gaCheckoutOption(3,'Paypal Express');
      sendEvent(['Basket Page', 'Checkout', 'Paypal Payment']);
    });
  }

  function page_checkout() {
    addProducts(uv.basket.line_items);
    gaCheckoutStep(2);
    sendEvent(['Your Details Page', 'Checkout', 'Details Viewed', {'nonInteraction': 1}]);

    $('[name="dwfrm_billing_paymentMethods_selectedPaymentMethodID"]').on('click', function() {
      var paymenttype = $(this).val();
      if ( $('.checkout-shipping-billing').valid() ) {
        //Update shipping method
        gaCheckoutOption(1,uv.basket.shipping_method);
        addProducts(uv.basket.line_items);
        gaCheckoutOption(3,paymenttype);
        sendEvent(['Payment Page', 'Checkout', 'Payment Options Viewed', {'nonInteraction': 1}]);
      }
    });
  }

  function page_orderconf() {
    var trns = uv.transaction;
    addProducts(trns.line_items);
    gaCheckoutOption(1,trns.shipping_method);

    ga(ga_ecSetAction, 'purchase', {
      'id': trns.order_id,
      'affiliation': 'Ann Summers - Online',
      'revenue': trns.total,
      'tax': trns.tax,
      'shipping': trns.shipping_cost
    });
    sendEvent(['Confirmation Page', 'Order Made', 'Order Confirmation', {'nonInteraction': 1}]);
  }

  // UTILITIES
  /**
   * function addProducts - Adds products to Enhance Ecommerce checkout
   * @param {object} line_items - UV line_items object to iterate over
   */
  function addProducts (line_items) {
    for (var i = 0; i < line_items.length; i++) {
      ga(ga_ecAddProduct, {
        'id': line_items[i].product.sku_code,
        'name': line_items[i].product.name,
        'price': line_items[i].product.unit_sale_price,
        'quantity': line_items[i].quantity,
        'category': line_items[i].product.category
      });
    }
  }

  /**
   * function gaCheckoutOption - Sets a checkout step
   * @param {integer} step - Checkout step number
   */
  function gaCheckoutStep(step) {
    ga(ga_ecSetAction, 'checkout', {'step': step});
    sendEvent(['Checkout', 'Checkout Step', step]);
  }

  /**
   * function gaCheckoutOption - Sets a checkout option against a given checkout step
   * @param {integer} step - Checkout step number
   * @param {string} value - Checkout option value
   */
  function gaCheckoutOption(step, value) {
    ga(ga_ecSetAction, 'checkout_option', {'step': step, 'option': value});
    sendEvent(['Checkout', 'Checkout Option Set', value]);
  }

  /**
   * function quickviewProductHandler - Binds events for quickview on PLP
   */
  function quickviewProductHandler () {
    $body.on('click.quickview', '.quickview-btn', function() {
      var itm = uv.listing.items[$('.quickview-btn').index(this)];
      ga(ga_ecAddProduct, {
        'id': itm.sku_code,
        'name': itm.name,
        'position': $('.quickview-btn').index(this) + 1
      });
      ga(ga_ecSetAction, 'click', {
        'list': list.name
      });
      sendEvent(['Product List', 'Result Quick Viewed', list.name]);

      ga(ga_ecAddProduct, {
        'id': itm.sku_code,
        'name': itm.name,
        'category': itm.category
      });
      ga(ga_ecSetAction, 'detail');
      sendEvent(['Product List', 'Quickview Product', itm.sku_code]);
    });
    $body.on('click.productview', '.name-link, .thumb-link', function() {
      var elem = $(this).hasClass('thumb-link') ? '.thumb-link' : '.name-link';
      var itm = uv.listing.items[$(elem).index(this)];
      ga(ga_ecAddProduct, {
        'id': itm.sku_code,
        'name': itm.name,
        'position': $(elem).index(this) + 1
      });
      ga(ga_ecSetAction, 'click', {
        'list': list.name
      });
      sendEvent(['Product List', 'Result Clicked', list.name]);
    });
    $body.on('click.basket_add', '#add-to-cart', function() {
      if ($(this).prop('disabled')) return;
      basketChange('add', uv, $('#Quantity').val());
    });
    $body.on('click.basket_add', '#product-set-list .add-to-cart', function() {
      if ($(this).prop('disabled')) return;
      var r = $(this).closest('.right-inner'),
      itm = {},
      qty = 1;
      try {
        var s = ($('.size li.selected', r).length) ? $.trim($('.size li.selected .selected', r).text()) : '',
        item_name = $('.item-name', r),
        item_id = item_name.prop('href');
        item_id = item_id.substring(item_id.lastIndexOf('/') + 1, item_id.lastIndexOf('.'));
        qty = $('.qty', r).val();
        itm.product = {
          'id': $.trim(item_id),
          'name': $.trim(item_name.text()),
          'variant': s,
          'unit_sale_price': $('.product-sales-price', r).text()
        };
        basketChange('add', itm, qty);
      } catch (ignore) {}
    });
    $body.on('click.basket_add_all', '#add-all-to-cart', function() {
      $('.product-set-list .right-inner').each(function() {
        var r = $(this),
        itm = {},
        qty = 1;
        try {
          if ($('.add-to-cart', r).length && !$('.add-to-cart', r).prop('disabled')) {
            var s = ($('.size li.selected', r).length) ? $.trim($('.size li.selected .selected', r).text()) : '',
            item_name = $('.item-name', r),
            item_id = item_name.prop('href');
            item_id = item_id.substring(item_id.lastIndexOf('/') + 1, item_id.lastIndexOf('.'));
            qty = $('.qty', r).val();
            itm.product = {
              'id': $.trim(item_id),
              'name': $.trim(item_name.text()),
              'variant': s,
              'unit_sale_price': $('.product-sales-price', r).text()
            };
            basketChange('add', itm, qty);
          }
        } catch (ignore) {}
      });
    });
  }

  /**
   * function basketProductHandler - Binds events to watch for product add/removes at basket
   */
  function basketProductHandler () {
    $('.remove').bind('click.basket_remove', function() {
      basketChange('remove', uv.basket.line_items[$(this).index()], uv.basket.line_items[$(this).index()].quantity);
    });
    var initial_qty;
    $('.cart-table-container .uf').on('focus.basket_edit', function() {
      initial_qty = $(this).val();
    }).on('change', function() {
      var qty = Math.abs(initial_qty - $(this).val());
      if (initial_qty > $(this).val()) {
        basketChange('remove', uv.basket.line_items[$(this).index()], qty);
      } else if (initial_qty < $(this).val()) {
        basketChange('add', uv.basket.line_items[$(this).index()], qty);
      }
    });
  }

  /**
   * function basketChange - Handles adding and removing products in the GA tracker object
   * @param {string} operation - add or remove depending on user iteraction
   * @param {object} item - contains information about the product being adding/removed
   * @param {integer} quantity - number of line items being added/removed
   */
  function basketChange(operation, item, quantity) {
    try {
      var item_price = '' + item.product.unit_sale_price.replace(/[^0-9\.]+/g, '');
      if (!isNaN(parseFloat(item_price))) {
        ga(ga_ecAddProduct, {
          'id': item.product.sku_code,
          'name': item.product.name,
          'variant': item.product.size || '',
          'price': item_price,
          'quantity': quantity,
          'category': item.product.category
        });
        if (operation) {
          if (operation == 'remove') {
            ga(ga_ecSetAction, 'remove');
            sendEvent(['Remove From Bag', 'Click', quantity + ' x ' + item.product.name]);
          } else {
            ga(ga_ecSetAction, 'add');
            sendEvent(['Add To Bag', 'Click', quantity + ' x ' + item.product.name]);
          }
        }
      }
    } catch (ignore) {}
  }

  /**
   * function getListData
   */
   function getListData() {
    var listData = {
      'name': ''
    };
    if (pgType === 'search') {
      listData.name = 'S: ' + uv.page.breadcrumb[0];
    } else if (pgType === 'category') {
      listData.name = 'C: ' + uv.page.breadcrumb[uv.page.breadcrumb.length - 1];
    }
    listData.name = listData.name.toUpperCase();
    return listData;
  }

  /**
   * function getPLPSort
   * @param {boolean} fireEvent - True fires a GA event hit - False does not.
   */
  function getPLPSort(fireEvent) {
    try {

      var sort ='default-sort';

      if (window.location.hash.indexOf('srule=') > -1) {
        var hsh = window.location.hash.substring(1);
        sort = hsh.split('srule=')[1].split('&')[0];
      }

      sort = sort.replace('%20','-');
      sort = sort.replace(' ','-');

      if (fireEvent) {
        sendEvent(['Product List','Sort Change',sort,{'dimension3': sort}]);
      }
    } catch (ignore) {}
    return sort.toLowerCase();
  }

  /**
   * function listImpressions
   */
  function listImpressions(list, startPoint) {

    var arr = uv.listing.items,
    items = 12;
    start = startPoint ? Number(startPoint) : 0;

    if (arr.length % items > 0) {
      var remainder = -Math.abs(arr.length % items);
      arr = arr.slice(remainder);
    } else if (arr.length > 12) {
      arr = arr.splice(12);
    }

    for (var i = 0; i < arr.length; i++) {
      try {
        ga(ga_ecAddImpression, {
          'id': arr[i].sku_code,
          'name': arr[i].name,
          'list': list.name,
          'position': start + i + 1
        });
        if(i == arr.length - 1) {
          sendEvent(['Product List','Results Returned',list.name,{'nonInteraction': 1}]);
        }
      } catch (ignore) {}
    }
  }

  /**
   * function getUrlVar - Returns params from a given URL
   * @param {string} url - A URL passed in to return the parameter on the end e.g. ?utm_campaign etc.
   */
  function getUrlVars(url) {
    var vars = [],
    hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

  /**
   * function sendEventToGA - Returns params from a given URL
   * @param {object} event - event data sent to GA
   * Example:
   * sendEventToGA({'category':'Video','action':'Play','label':'Summer Campaign Trailer', options:{'nonInteraction': 1}})
   */
  function sendEvent(event) {
    if (event instanceof Array) {
      if (event.length == 4) {
        ga(ga_send, 'event', '' + event[0], '' + event[1], '' + event[2], event[3])
      } else {
        ga(ga_send, 'event', '' + event[0], '' + event[1], '' + event[2])
      }
    } else {
      if (event && event.category && event.action && event.label) {
        if(event.options) {
          ga(ga_send, 'event', '' + event.category, '' + event.action, '' + event.label, event.options)
        } else {
          ga(ga_send, 'event', '' + event.category, '' + event.action, '' + event.label)
        }
      } else {
        console.log('Event argument object must contain: category, action and label e.g. sendEventToGA({\'category\':\'Video\',\'action\':\'Play\',\'label\':\'Summer Campaign Trailer\'})')
      }
    }
  }
  window.sendEventToGA = sendEvent;
}

