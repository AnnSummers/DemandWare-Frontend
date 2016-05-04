<script>
/**
 * GA Account IDs:-
 * PRODUCTION (Real transaction data): UA-6722890-1
 * PRE-DEPLOYMENT (Real transaction data): UA-55800919-1
 * STAGING (Staging only data): UA-64827939-1
 */
 (function(_uv) {
    'use strict';

    var USE_PREDEPLOY = false; // Set to false if deploying PRODUCTION tracking

    // SET THE ACCOUNT ID
    var ga_account = (USE_PREDEPLOY) ? 'UA-55800919-1' : (_uv.page.environment == 'production') ? 'UA-6722890-1' : 'UA-64827939-1';

    // INCLUDE GA SCRIPT
    (function(i, s, o, g, r, a, m) {
        i.GoogleAnalyticsObject = r;
        i[r] = i[r] || function() {(i[r].q = i[r].q || []).push(arguments);}, i[r].l = 1 * new Date();
        a = s.createElement(o), m = s.getElementsByTagName(o)[0];a.async = 1;
        a.src = g;m.parentNode.insertBefore(a, m);
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    
    try {console.log('ga exec:' + performance.now() / 1000 + ' secs')} catch (ignore) {}

    // CREATE A TRACKER & NAME IT e.g. 'liveTracker'
    ga('create', ga_account, 'auto', 'liveTracker');

    // ADD GA PLUGINS
    ga('liveTracker.require', 'ec');
    ga('liveTracker.require', 'displayfeatures');

    // SEND PAGEVIEW
    ga('liveTracker.send', 'pageview');

    // UTILITIES
    /**
     * function getUrlVar - Returns params from a given URL
     * @param {string} url - A URL passed in to return the parameter on the end e.g. ?utm_campaign etc.
     */
    function getUrlVars(url){
        var vars=[],hash;var hashes=url.slice(url.indexOf('?')+1).split('&');
        for(var i=0;i<hashes.length;i++){hash=hashes[i].split('=');vars.push(hash[0]);vars[hash[0]]=hash[1];}
            return vars;
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
                ga('liveTracker.ec:addProduct', {
                    'id': item.product.sku_code,
                    'name': item.product.name,
                    'variant': item.product.size || '',
                    'price': item_price,
                    'quantity': quantity,
                    'catagory': item.product.category
                });
                if (operation) {
                    if (operation == 'remove') {
                        ga('liveTracker.ec:setAction', 'remove');
                        ga('liveTracker.send', 'event', 'Remove From Bag', 'Click', quantity + ' x ' + item.product.name);
                    } else {
                        ga('liveTracker.ec:setAction', 'add');
                        ga('liveTracker.send', 'event', 'Add To Bag', 'Click', quantity + ' x ' + item.product.name);
                    }
                }
            }
        } catch (ignore) {}
    }

    /**
     * function listImpressions
     * @param {object} results - Contains a list of product objects with price, sku, product name etc
     */
    function listImpressions(results) {
        var listData = {
            'name': '',
            'sort': 'Default Sort',
            'results': results || ''
        };
        try {
            if (_uv.page.type.toLowerCase() === 'search') {
                listData.name = 'S: ' + _uv.page.breadcrumb[0];
            } else if (_uv.page.type === 'category') {
                listData.name = 'C: ' + _uv.page.breadcrumb[_uv.page.breadcrumb.length - 1];
            }
        } catch (ignore) {}
        try {
            listData.sort = $('.sort-by .selector span').first().text();
            listData.sort = (listData.sort.indexOf('Sort by') > -1) ? 'Default Sort' : listData.sort;
        } catch (ignore) {}
        for (var i = 0; i < _uv.listing.items.length; i++) {
            try {
                ga('liveTracker.ec:addImpression', {
                    'id': _uv.listing.items[i].sku_code,
                    'name': _uv.listing.items[i].name,
                    'list': listData.name.toUpperCase(),
                    'position': i + 1
                });
            } catch (ignore) {}
        }
        ga('liveTracker.send', 'event', 'Product List', 'Results Returned', listData.name.toUpperCase(), {
            'nonInteraction': true,
            'dimension1': listData.results,
            'dimension2': '1 to ' + _uv.listing.items.length,
            'dimension4': listData.sort
        });
        return listData;
    }

    // PAGE EVENTS
    if (_uv.page.type.toLowerCase() === 'basket') {
        for (var i = 0; i < _uv.basket.line_items.length; i++) {
            basketChange(false, 'add', _uv.basket.line_items[i], _uv.basket.line_items[i].quantity);
        }
        ga('liveTracker.ec:setAction', 'checkout', {
            'step': 1,
            'option': _uv.basket.shipping_method
        });
        ga('liveTracker.send', 'event', 'Basket Page', 'Basket Viewed', {
            'nonInteraction': true
        });
        $('.remove').bind('click.basket_remove', function() {
            basketChange('remove', _uv.basket.line_items[$(this).index()], _uv.basket.line_items[$(this).index()].quantity);
        });
        var initial_qty;
        $('.cart-table-container .uf').on('focus.basket_edit', function() {
            initial_qty = $(this).val();
        }).on('change', function() {
            var qty = Math.abs(initial_qty - $(this).val());
            if (initial_qty > $(this).val()) {
                basketChange('remove', _uv.basket.line_items[$(this).index()], qty);
            } else if (initial_qty < $(this).val()) {
                basketChange('add', _uv.basket.line_items[$(this).index()], qty);
            }
        });
        $('[name="dwfrm_cart_checkoutCart"]').one('click.ga_checkout', function() {
            ga('liveTracker.send', 'event', 'Basket Page', 'Checkout', 'Card Payment');
        });
        $('[name="dwfrm_cart_expressCheckout"]').one('click.ga_checkout', function() {
            ga('liveTracker.ec:setAction', 'checkout', {
                'step': 2
            });
            ga('liveTracker.ec:setAction', 'checkout', {
                'step': 3,
                'option': 'Paypal Express'
            });
            ga('liveTracker.send', 'event', 'Basket Page', 'Checkout', 'Paypal Payment');
        });
    }
    if (_uv.page.type.toLowerCase() === 'checkout' && _uv.page.breadcrumb == 'checkoutprogressindicator.billing') {
        ga('liveTracker.ec:setAction', 'checkout', {
            'step': 2
        });
        ga('liveTracker.send', 'event', 'Your Details Page', 'Details Viewed', {
            'nonInteraction': true
        });
        var step3 = function(type) {
            for (var i = 0; i < _uv.basket.line_items.length; i++) {
                ga('liveTracker.ec:addProduct', {
                    'id': _uv.basket.line_items[i].product.sku_code,
                    'name': _uv.basket.line_items[i].product.name,
                    'price': _uv.basket.line_items[i].product.unit_sale_price,
                    'quantity': _uv.basket.line_items[i].quantity,
                    'category': _uv.basket.line_items[i].product.category
                });
            }
            ga('liveTracker.ec:setAction', 'checkout', {
                'step': 3,
                'option': type
            });
            ga('liveTracker.send', 'event', 'Payment Page', 'Payment Options Viewed', {
                'nonInteraction': true
            });
        };
        $('[name="dwfrm_billing_paymentMethods_selectedPaymentMethodID"]').on('click', function() {
            step3($(this).val());
        });
    }
    if (_uv.page.type.toLowerCase() === 'confirmation') {
        for (var j = 0; j < _uv.transaction.line_items.length; j++) {
            ga('liveTracker.ec:addProduct', {
                'id': _uv.transaction.line_items[j].product.sku_code,
                'name': _uv.transaction.line_items[j].product.name,
                'price': _uv.transaction.line_items[j].product.unit_sale_price,
                'quantity': _uv.transaction.line_items[j].quantity,
                'category': _uv.transaction.line_items[j].category
            });
        }
        ga('liveTracker.ec:setAction', 'purchase', {
            'id': _uv.transaction.order_id,
            'affiliation': 'Ann Summers - Online - ' + _uv.transaction.payment_type,
            'revenue': _uv.transaction.total,
            'tax': _uv.transaction.tax,
            'shipping': _uv.transaction.shipping_cost
        });
        ga('liveTracker.send', 'event', 'Confirmation Page', 'Order Made', {
            'nonInteraction': true
        });
    }
    if (_uv.page.type.toLowerCase() === 'product') {
        ga('liveTracker.ec:addProduct', {
            'id': _uv.product.sku_code,
            'name': _uv.product.name
        });
        ga('liveTracker.ec:setAction', 'detail');
        ga('liveTracker.send', 'event', 'Product Page', 'View', _uv.product.name, {
            'nonInteraction': true
        });
        $('body').on('click.basket_add', '.add-to-cart', function() {
            if ($(this).prop('disabled')) return;
            var r = $(this).closest('.product-content'), itm = {}, qty = 1;
            try {
                var item_name = $.trim($('.product-name', r).children().text()),
                item_id = $('input.pid', r).val(),
                item_size = $('.size-attribute', r).length ? $('.swatches .selected .selected', r).text() : _uv.product.size,
                item_price = $('.product-sales-price', r).text() || _uv.product.unit_sale_price;
                qty = $('.qty', r).val();
                itm.product = {
                    'id': $.trim(item_id),
                    'name': item_name ? item_name : _uv.product.name,
                    'variant': item_size ? $.trim(item_size) : 'N/A',
                    'unit_sale_price': item_price
                };
            } catch (ignore) {}
            basketChange('add', itm, qty);
        });
        $('body').on('click.basket_add_all', '#add-all-to-cart', function() {
            $('.product-set-list .right-inner').each(function() {
                var r = $(this), itm = {}, qty = 1;
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
    if (_uv.page.type.toLowerCase() === 'category' || _uv.page.type.toLowerCase() === 'search') {
        var resultCount = $.trim($('.switch .count:eq(0)').text().replace(' Results', '')),
        listData = listImpressions(resultCount);
        $(document).ajaxComplete(function(e, x, o) {
            if (getUrlVars(o.url).sz && getUrlVars(o.url).format == 'page-element') {
                listImpressions(resultCount);
            }
        });
        $('body').on('click.quickview', '.quickview-btn', function() {
            var itm = _uv.listing.items[$('.quickview-btn').index(this)];
            ga('liveTracker.ec:addProduct', {
                'id': itm.sku_code,
                'name': itm.name,
                'position': $('.quickview-btn').index(this) + 1
            });
            ga('liveTracker.ec:setAction', 'click', {
                'list': listData.name
            });
            ga('liveTracker.send', 'event', 'Product List', 'Result Quick Viewed', listData.name, {
                'dimension1': resultCount,
                'dimension2': '1 to ' + _uv.listing.items.length,
                'dimension3': itm.sku_code
            });
        });
        $('body').on('click.productview', '.name-link, .thumb-link', function() {
            var elem = $(this).hasClass('thumb-link') ? '.thumb-link' : '.name-link';
            var itm = _uv.listing.items[$(elem).index(this)];
            ga('liveTracker.ec:addProduct', {
                'id': itm.sku_code,
                'name': itm.name,
                'position': $(elem).index(this) + 1
            });
            ga('liveTracker.ec:setAction', 'click', {
                'list': listData.name
            });
            ga('liveTracker.send', 'event', 'Product List', 'Result Clicked', listData.name, {
                'dimension1': resultCount,
                'dimension2': '1 to ' + _uv.listing.items.length,
                'dimension3': itm.sku_code
            });
        });
        $('body').on('click.basket_add', '#add-to-cart', function() {
            if ($(this).prop('disabled')) return;
            basketChange('add', _uv, $('#Quantity').val());
        });
        $('body').on('click.basket_add', '#product-set-list .add-to-cart', function() {
            if ($(this).prop('disabled')) return;
            var r = $(this).closest('.right-inner'), itm = {}, qty = 1;
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
        $('body').on('click.basket_add_all', '#add-all-to-cart', function() {
            $('.product-set-list .right-inner').each(function() {
                var r = $(this), itm = {}, qty = 1;
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
    //Sign-up pop-up
    if ( $.inArray('eml_fld', getUrlVars(window.location.href)) > -1 && _uv.page.breadcrumb[0].toLowerCase() == 'my acount') {
        ga('liveTracker.send', 'event', 'Login/Register', 'Pop-up Viewed', 'Newsletter Sign-up Pop-up Viewed');
    }
    //Registration sign-up
    if ( $.inArray('registration', getUrlVars(window.location.href)) > -1 && _uv.page.breadcrumb[0].toLowerCase() == 'my acount') {
        ga('liveTracker.send', 'event', 'Login/Register', 'Account Registered', 'New Account Created');
    }
    try {console.log('ga exec end:' + performance.now() / 1000 + ' secs')} catch (ignore) {}
})(universal_variable);
</script>
