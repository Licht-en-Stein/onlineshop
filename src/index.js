//  import core files
import $ from 'jquery';
import 'bootstrap/js/src';
import './styles.scss';
import navbarTemplate from './templates/navbar.html';
import modalTemplate from './templates/modal.html';
import checkoutTemplate from './templates/checkout.html';
import paymentMethodRadioTemplate from './templates/payment-method-radio.html';
import mkCarousel from './carousel';
import refreshProducts from './products';

//  append navbar
$(() => {
  const $pageContent = $('<div class="page-content"></div>');
  $('#root')
    .append(modalTemplate)
    .append(navbarTemplate)
    .append($pageContent);

  $('.shopping-cart, #cart').hide();

  function handleAJAXError(xhr, status, error) {
    $pageContent
      .empty()
      .append(`<div>Ajax Error categories: ${error}</div>`);
  }

  $('.login-nav').hide();
  $('.register-nav').hide();
  const loggedUser = JSON.parse(localStorage.getItem('user'));
  if (loggedUser === null) {
    $('#user').hide();
    $('#logout').hide();
  } else {
    $('#login').hide();
    $('#register').hide();
    $('.user-logged').text(` ${loggedUser.firstname}`);
  }

  $('#login').click((e) => {
    e.preventDefault();
    // default userdata
    $('#log-email').val('smtpcrimson@gmail.com1');
    $('#inputPassword').val('halloworld');
    $('.login-nav').toggle('slow');
    if ($('.register-nav').is(':visible')) {
      $('.register-nav').hide();
    }
    $('#inputEmail').focus();
  });

  $('.info-log').click((e) => {
    e.preventDefault();
    $('.register-nav').toggle('slow');
    if ($('.login-nav').is(':visible')) {
      $('.login-nav').hide();
    }
    $('#inputEmail').focus();
  });

  $('#logout').click(() => {
    localStorage.removeItem('user');
    $('#logout').hide();
    $('#user').hide();
    $('#login').show();
    $('#register').show();
  });

  $('.form-signin').on('submit', (() => {
    /* eslint-disable */
    const bcrypt = require('bcryptjs');

    bcrypt.hash($('#inputPassword').val(), 10, (err, hash) => {

      console.log('hash: ', hash);
      
      $.ajax('http://localhost:9090/api/login', {
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            email: $('#log-email').val(),
            password: hash,
          }),
        })
        .done((msg) => {
          console.log(msg);
          console.log(msg.err);

          if (msg.err === undefined) {
            localStorage.setItem('user', JSON.stringify(msg));
            const signedUser = JSON.parse(localStorage.getItem('user'));
            $('.login-nav').hide();
            $('#login').hide();
            $('#register').hide();
            $('#user').show();
            $('#logout').show();
            $('.user-logged').text(` ${signedUser.firstname}`);
          } else {
            $('.alert-danger').remove();
            $('.login-nav').append(`
              <div class="alert alert-danger" role="alert">
              ${msg.err}
              </div>
              `)
          }
        })
        .fail(() => {});
    });
  }));
  /* eslint-enable */

  /*
      function selectActiveUser(id) {
        $.ajax(`http://localhost:9090/api/customers/${id}`)
          .done((user) => {
            const userInfo = {
              id: user[0].id,
              firstname: user[0].firstname,
              lastname: user[0].lastname,
              email: user[0].email,
              phone: user[0].phone,
              city: user[0].city,
              postal: user[0].postal,
              street: user[0].street,
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            const signedUser = JSON.parse(localStorage.getItem('user'));
            e.preventDefault();
            $('.login-nav').hide();
            $('#login').hide();
            $('#register').hide();
            $('#user').show();
            $('#logout').show();
            $('.user-logged').text(` ${signedUser.firstname}`);
          });
      }
      // make a query for all the active users in our shop
      $.ajax('http://localhost:9090/api/activecustomers')
        .done((userIDs) => {
          const arrayIDs = [];
          userIDs.forEach((id) => {
            arrayIDs.push(id);
          });
          const activeUserID = [];
          for (let i = 0; i < arrayIDs.length; i += 1) {
            activeUserID.push(arrayIDs[i].id);
          }
          const max = activeUserID.length - 1;
          const userID = Math.floor(Math.random() * max);
          // selected one user with a random math of its id
          selectActiveUser(activeUserID[userID]);
        });
      // End
      */


  $('.form-register').on('submit', ((e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    const user = {};
    user.firstname = $('.form-register #firtsname').val();
    user.lastname = $('.form-register #lastname').val();
    user.birthdate = $('.form-register #birthdate').val();
    user.phone = $('.form-register #phone').val();
    user.city = $('.form-register #city').val();
    user.street = $('.form-register #street').val();
    user.postal = $('.form-register #postal').val();
    user.email = $('.form-register #email').val();
    localStorage.setItem('user', JSON.stringify(user));
    $('.register-nav').hide();
    $('#login').hide();
    $('.user-logged').text(user.firstname).show();
    $('.user-register').hide();
    $('#logout').show();
  }));

  $('#register').click((e) => {
    e.preventDefault();
    $('.register-nav').toggle('slow');
    if ($('.login-nav').is(':visible')) {
      $('.login-nav').hide();
    }
    $('#firstname').focus();
  });

  $('.info-reg').click((e) => {
    e.preventDefault();
    $('.login-nav').toggle('slow');
    if ($('.register-nav').is(':visible')) {
      $('.register-nav').hide();
    }
    $('#inputEmail').focus();
  });

  $('#cart').click(((e) => {
    e.preventDefault();
    $('.shopping-cart').toggle('slow');
    if ($('.login-nav').is(':visible')) {
      $('.login-nav').hide();
    }
  }));

  // checkout method
  $('.checkout-proceed').click(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const $checkout = $(checkoutTemplate);
    $checkout.find('[name="user-name"]').val(`${userData.firstname} ${userData.lastname}`);
    $checkout.find('[name="user-street"]').val(userData.street);
    $checkout.find('[name="user-city"]').val(`${userData.postal} ${userData.city}`);
    $('.shopping-cart').hide();
    const storedProducts = JSON.parse(localStorage.getItem('cart'));
    const $productsList = $checkout.find('.products-list');
    storedProducts.forEach((product) => {
      $productsList.append(`<li>
            <span class="product-name">${product.name}</span>
            <span class="product-price">${product.price}</span>
            <span class="product-quantity">${product.quantity}</span>
            </li>`);
    });

    const totalPrice = JSON.parse(localStorage.getItem('totalPrice'));
    $checkout.find('.cart-total').text(`Total ${totalPrice}`);

    $('.page-content')
      .empty()
      .append($checkout);

    $checkout.find('.checkout-buy').click((evt) => {
      evt.preventDefault();
      const data = JSON.stringify({
        products: storedProducts,
        user: {
          customer_id: userData.id,
          user_email: userData.email,
          name: $checkout.find('[name="user-name"]').val(),
          street: $checkout.find('[name="user-street"]').val(),
          city: $checkout.find('[name="user-city"]').val(),
        },
        payment_method: $checkout.find('[name="payment"]:checked').val(),
        total_price: totalPrice,
      });

      /* eslint-disable */
      $.ajax('http://localhost:9090/api/order', {
          method: 'POST',
          contentType: 'application/json',
          data,
        })
        /* eslint-enable */
        .done(() => {
          $checkout
            .empty()
            .append(`
            <div class="alert alert-success" role="alert">
            This is a success alert—check it out!
            </div>`);
        })
        // eslint-disable-next-line
        .fail((...args) => console.info('error', ...args));
    });


    const $paymentMethods = $checkout
      .find('.payment-methods')
      .empty();

    $.ajax('http://localhost:9090/api/payment_methods')
      .done((data) => {
        data.forEach((paymentMethod) => {
          const $paymentMethod = $(paymentMethodRadioTemplate);
          $paymentMethod.find('input').attr('value', paymentMethod.id);
          $paymentMethod.find('img')
            .attr('src', paymentMethod.icon)
            .attr('alt', paymentMethod.method);
          $paymentMethods.append($paymentMethod);
        });
      })
      .fail(handleAJAXError);
    // loading products
  });

  // $pageContent.css(('padding-top'), $('.navbar').outerHeight());

  //  read categories
  $.ajax('http://localhost:9090/api/categories')
    .done((categories) => {
      //  populate carousel with categories
      const $carousel = mkCarousel(categories);
      $pageContent.append($carousel);
      $carousel.carousel();
      //  Iterate over the categories and append to navbar
      categories.forEach((category, number) => {
        $('.navbar-nav').append(`
            <li class="nav-item">
            <a class="nav-link" data-id="${number}" data-name="${category.name}" href="#">${category.name}</a>
            </li>`);
      });
    })
    //  or fail trying
    .fail(handleAJAXError);

  //  ajax req and append products grid
  $.ajax('http://localhost:9090/api/products')
    .done((products) => {
      //  append products-grid after carousel
      $pageContent
        .append(`<div class="infobox"><h2 id="infos">All products (${Object.keys(products).length})</h2></div>`)
        .append('<div id="products-grid" class="container-fluid"></div>');
      //  populate products-grid with products
      $('#products-grid').append('<div class="row"></div>');
      refreshProducts(products, '-1');
      // click event handler on nav-links
      $('.nav-link').click((eventObj) => {
        eventObj.preventDefault();
        const { target } = eventObj;
        const linkName = target.getAttribute('data-id');
        $('.navbar-nav .active').removeClass('active');
        $(target).closest('li').addClass('active');
        //  clean the products-grid and update the content
        refreshProducts(products, linkName);
      });
    })
    //  or fail trying
    .fail(handleAJAXError);

  // Add a random active user ID

  // Select an active user by his id and storage the data as an object in the localStorage
  /*
    function selectActiveUser(id) {
      $.ajax(`http://localhost:9090/api/customers/${id}`)
        .done((user) => {
          const userInfo = {
            id: user[0].id,
            firstname: user[0].firstname,
            lastname: user[0].lastname,
            email: user[0].email,
            phone: user[0].phone,
            city: user[0].city,
            postal: user[0].postal,
            street: user[0].street,
          };
          localStorage.setItem('User', JSON.stringify(userInfo));
        });
    }

    // make a query for all the active users in our shop
    $.ajax('http://localhost:9090/api/activecustomers')
      .done((userIDs) => {
        const arrayIDs = [];
        userIDs.forEach((id) => {
          arrayIDs.push(id);
        });
        const activeUserID = [];
        for (let i = 0; i < arrayIDs.length; i += 1) {
          activeUserID.push(arrayIDs[i].id);
        }
        const max = activeUserID.length - 1;
        const userID = Math.floor(Math.random() * max);
        // selected one user with a random math of its id
        selectActiveUser(activeUserID[userID]);
      });

    localStorage.removeItem('User');
    // End
    */
});
