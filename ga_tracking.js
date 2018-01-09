function () {
  'use strict';

  console.log('GA Version v1.6.1');

  // INCLUDE GA SCRIPT
  (function(i, s, o, g, r, a, m) {
    i.GoogleAnalyticsObject = r;
    i[r] = i[r] || function() {(i[r].q = i[r].q || []).push(arguments);}, i[r].l = 1 * new Date();
    a = s.createElement(o), m = s.getElementsByTagName(o)[0];a.async = 1;
    a.src = g;m.parentNode.insertBefore(a, m);
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

  /**
   * GA Account IDs:-
   * PRODUCTION (Real transaction data): UA-6722890-1
   * PRE-DEPLOYMENT (Real transaction data): UA-55800919-1
   * STAGING (Staging only data): UA-64827939-1
   */
  var uv = universal_variable,
      $body = $('body'),
      pageGroup = 'Content/Other',
      thisUrl = window.location.href;
      isHelpPage = this.valueForToken('isHelpPage'),
      ga_tracker = this.valueForToken('ga_tracker'),
      ga_account = this.valueForToken('ga_account'),
      set = ga_tracker + '.set',
      send = ga_tracker + '.send',
      require = ga_tracker + '.require',
      ecSetAction = ga_tracker + '.ec:setAction',
      ecAddProduct = ga_tracker + '.ec:addProduct',
      ecAddImpression = ga_tracker + '.ec:addImpression',

  // CREATE A TRACKER & NAME IT e.g. 'testTracker'
  ga('create', ga_account, 'auto', ga_tracker);

  // ADD GA PLUGINS
  ga(require, 'ec');
  ga(require, 'linkid');
  ga(require, 'displayfeatures');

  switch (uv.page.type) {
    case 'home':
      pageGroup = 'Homepage';
      break;
    case 'search':
      pageGroup = 'Search';
      ga(set, 'dimension3', getPLPSort());
      break;
    case 'category':
      if(thisUrl.indexOf('deliveryreturns') == -1 && thisUrl.indexOf('help-advice') == -1) {
        pageGroup = 'PLP';
        if(!$('.categorylanding').length) {
          ga(set, 'dimension3', getPLPSort());
        }
      }
      break;
    case 'product':
      pageGroup = 'PDP';
      break;
    case 'basket':
      pageGroup = (thisUrl.indexOf('WorldPay-Cancel') > -1) ? 'Order Cancellation' : 'Basket';
      break;
    case 'checkout':
       pageGroup = (thisUrl.indexOf('WorldPay-Cancel') > -1) ? 'Order Cancellation' : 'Checkout';
      break;
    case 'confirmation':
      pageGroup = 'Order Confirmation';
      break;
    default:
      if ( isHelpPage ) {
        pageGroup = 'Help Pages'
      }
      if (thisUrl.indexOf('blog') > -1) {
        pageGroup = 'Blog'
      }
  }

  ga(set, 'contentGroup1', pageGroup);

  // SEND PAGEVIEW
  ga(send, 'pageview');

  // PAGE EVENTS
  if (uv.page.type.toLowerCase() === 'basket') {
    if ($('.error-message').length) {
      try {
        var error_str = $('.error-message').text();
        if (error_str.length) {
          sendEvent(['Basket', 'Error', error_str, {'nonInteraction': 1}]);
        }
      } catch (ignore) {}
    }

    for (var i = 0; i < uv.basket.line_items.length; i++) {
      basketChange(false, 'add', uv.basket.line_items[i], uv.basket.line_items[i].quantity);
    }
    ga(ecSetAction, 'checkout', {
      'step': 1,
      'option': uv.basket.shipping_method
    });
    sendEvent(['Basket Page', 'Basket Viewed', {'nonInteraction': 1}]);
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
    $('[name="dwfrm_cart_checkoutCart"]').one('click.ga_checkout', function() {
      sendEvent(['Basket Page', 'Checkout', 'Card Payment']);
    });
    $('[name="dwfrm_cart_expressCheckout"]').one('click.ga_checkout', function() {
      ga(ecSetAction, 'checkout', {
        'step': 2
      });
      ga(ecSetAction, 'checkout', {
        'step': 3,
        'option': 'Paypal Express'
      });
      sendEvent(['Basket Page', 'Checkout', 'Paypal Payment']);
    });
  }

  if (uv.page.type.toLowerCase() === 'checkout' && uv.page.breadcrumb == 'checkoutprogressindicator.billing') {
    ga(ecSetAction, 'checkout', {
      'step': 2
    });
    sendEvent(['Your Details Page', 'Details Viewed', {'nonInteraction': 1}]);
    var step3 = function(type) {
      for (var i = 0; i < uv.basket.line_items.length; i++) {
        ga(ecAddProduct, {
          'id': uv.basket.line_items[i].product.sku_code,
          'name': uv.basket.line_items[i].product.name,
          'price': uv.basket.line_items[i].product.unit_sale_price,
          'quantity': uv.basket.line_items[i].quantity,
          'category': uv.basket.line_items[i].product.category
        });
      }
      ga(ecSetAction, 'checkout', {
        'step': 3,
        'option': type
      });
      sendEvent(['Payment Page', 'Payment Options Viewed', {'nonInteraction': 1}]);
    };
    $('[name="dwfrm_billing_paymentMethods_selectedPaymentMethodID"]').on('click', function() {
      step3($(this).val());
    });
  }

  if (uv.page.type.toLowerCase() === 'confirmation') {
    var trns = uv.transaction;
    for (var j = 0; j < trns.line_items.length; j++) {
      ga(ecAddProduct, {
        'id': trns.line_items[j].product.sku_code,
        'name': trns.line_items[j].product.name,
        'price': trns.line_items[j].product.unit_sale_price,
        'quantity': trns.line_items[j].quantity,
        'category': trns.line_items[j].product.category
      });
    }
    ga(ecSetAction, 'purchase', {
      'id': trns.order_id,
      'affiliation': 'Ann Summers - Online - ' + trns.payment_type,
      'revenue': trns.total,
      'tax': trns.tax,
      'shipping': trns.shipping_cost
    });
    sendEvent(['Confirmation Page', 'Order Made', {'nonInteraction': 1}]);
  }

  if (uv.page.type.toLowerCase() === 'product') {
    ga(ecAddProduct, {
      'id': uv.product.sku_code,
      'name': uv.product.name,
      'category': uv.product.category
    });
    ga(ecSetAction, 'detail');
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
  if (uv.page.type.toLowerCase() === 'category' && !$('.categorylanding').length || uv.page.type.toLowerCase() === 'search') {
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

    $body.on('click.quickview', '.quickview-btn', function() {
      var itm = uv.listing.items[$('.quickview-btn').index(this)];
      ga(ecAddProduct, {
        'id': itm.sku_code,
        'name': itm.name,
        'position': $('.quickview-btn').index(this) + 1
      });
      ga(ecSetAction, 'click', {
        'list': list.name
      });
      sendEvent(['Product List', 'Result Quick Viewed', list.name]);
    });
    $body.on('click.productview', '.name-link, .thumb-link', function() {
      var elem = $(this).hasClass('thumb-link') ? '.thumb-link' : '.name-link';
      var itm = uv.listing.items[$(elem).index(this)];
      ga(ecAddProduct, {
        'id': itm.sku_code,
        'name': itm.name,
        'position': $(elem).index(this) + 1
      });
      ga(ecSetAction, 'click', {
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

  //EVENTS, CUSTOM METRICS & CUSTOM DIMENSIONS

  //Sign-up pop-up
  if ($.inArray('eml_fld', getUrlVars(thisUrl)) > -1 && uv.page.breadcrumb[0].toLowerCase() == 'my account') {
    sendEvent(['Login/Register', 'Pop-up Viewed', 'Newsletter Sign-up Pop-up Viewed']);
  }
  //Registration sign-up
  if ($.inArray('registration', getUrlVars(thisUrl)) > -1 && uv.page.breadcrumb[0].toLowerCase() == 'my account') {
    sendEvent(['Login/Register', 'Account Registered', 'New Account Created']);
  }


  // UTILITIES

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
        ga(ecAddProduct, {
          'id': item.product.sku_code,
          'name': item.product.name,
          'variant': item.product.size || '',
          'price': item_price,
          'quantity': quantity,
          'category': item.product.category
        });
        if (operation) {
          if (operation == 'remove') {
            ga(ecSetAction, 'remove');
            sendEvent(['Remove From Bag', 'Click', quantity + ' x ' + item.product.name]);
          } else {
            ga(ecSetAction, 'add');
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
    if (uv.page.type.toLowerCase() === 'search') {
      listData.name = 'S: ' + uv.page.breadcrumb[0];
    } else if (uv.page.type === 'category') {
      listData.name = 'C: ' + uv.page.breadcrumb[uv.page.breadcrumb.length - 1];
    }
    listData.name = listData.name.toUpperCase();
    return listData;
  }

  /**
   * function getPLPSort
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
        ga(ecAddImpression, {
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
        ga(send, 'event', '' + event[0], '' + event[1], '' + event[2], event[3])
      } else {
        ga(send, 'event', '' + event[0], '' + event[1], '' + event[2])
      }
    } else {
      if (event && event.category && event.action && event.label) {
        if(event.options) {
          ga(send, 'event', '' + event.category, '' + event.action, '' + event.label, event.options)
        } else {
          ga(send, 'event', '' + event.category, '' + event.action, '' + event.label)
        }
      } else {
        console.log('Event argument object must contain: category, action and label e.g. sendEventToGA({\'category\':\'Video\',\'action\':\'Play\',\'label\':\'Summer Campaign Trailer\'})')
      }
    }
  }
  window.sendEventToGA = sendEvent;
}