//Set waypoint classes to opacity:0    
$('.scrollfade, .scrollleft, .scrollright, .scrollbounce').css('opacity', 0);  //immediately hide element

  
$(function() {
  var loc = window.location.href; // returns the full URL
  $('body').removeClass();
  if(/design/.test(loc)) {
    $('body').addClass('design');
  }
  if(/photo/.test(loc)) {
    $('body').addClass('photo');
  }
  if(/info/.test(loc)) {
    $('body').addClass('info');
  }
  if(/cocktails/.test(loc)) {
    $('body').addClass('cocktails');
  }
  if(/asana/.test(loc)) {
    $('body').addClass('asana');
  }
 
});
  

$(document).ready(function() {


$('.black-arrow').click(function () {
      $('html, body').animate({
          scrollTop: $('.approach').offset().top
      }, 800, "easeOutQuart");
  });
  
  $('#scroll-work').click(function () {
      $('html, body').animate({
          scrollTop: $('#dribbble').offset().top
      }, 1000, "easeOutQuart");
  });
  
  $('.photo-arrow').click(function () {
      $('html, body').animate({
          scrollTop: $('.photos').offset().top
      }, 800, "easeOutQuart");
  });
  
  $('.info-arrow').click(function () {
      $('html, body').animate({
          scrollTop: $('.information').offset().top
      }, 800, "easeOutQuart");
  });
  
  
  
  
  
jribbble.shots({token: "7127ba555e5f9d44e02e07b38b9bbc5cc994a76bb2603de2942667e4c628aa9f"}, function(shots) {
  document.querySelector(".shots").innerHTML = shots.reduce(function(html, shot) {
    return html + '<li><a href="'+  shot.html_url + '" target="_blank"><figure><img src="' + shot.images.hidpi + '"><figcaption><h3>' + shot.title + '</h3><p>View on Dribbble</p></figcaption></figure></a></li>';
  }, "");
});



  
/*
$.jribbble.setToken('50f265ebeeabc6f5434a4c4d98ceb176854ff00c4defe926f7c775c3f0530bc1');

$.jribbble.users('adambutler').shots({per_page: 24}).then(function(shots) {
  var html = [];
  
  shots.forEach(function(shot) {
    html.push('<li>');
    html.push('<a href="' + shot.html_url + '" target="_blank">');
    html.push('<figure>');
    html.push('<img src="' + shot.images.hidpi + '">');
    html.push('<figcaption>');
    html.push('<h3>' + shot.title + '</h3>');
    html.push('<p>View on Dribbble</p>');
    html.push('</figcaption></figure></a></li>');
  });
  
  $('.shots').html(html.join(''));
});
*/
  
  
  
  
  
  
  
  // browser window scroll (in pixels) after which the "back to top" link is shown
	var offset = 1600,
		//browser window scroll (in pixels) after which the "back to top" link opacity is reduced
		offset_opacity = 2400,
		//duration of the top scrolling animation (in ms)
		scroll_top_duration = 1600,
		//grab the "back to top" link
		$back_to_top = $('.scroll-top');

	//hide or show the "back to top" link
	$(window).scroll(function(){
		( $(this).scrollTop() > offset ) ? $back_to_top.addClass('scroll-is-visible') : $back_to_top.removeClass('scroll-is-visible scroll-fade-out');
		if( $(this).scrollTop() > offset_opacity ) { 
			$back_to_top.addClass('scroll-fade-out');
		}
	});

	//smooth scroll to top
	$back_to_top.on('click', function(event){
		event.preventDefault();
		$('body,html').animate({
			scrollTop: 0 ,
		 	}, scroll_top_duration, "easeOutQuart"
		);
	});


if($('#instafeed').length) {
var userFeed = new Instafeed({
        get: 'user',
        userId: 12230215,
        accessToken: '12230215.1677ed0.95b84b6323e54c58bbca97a58932a5bf',
        template: '<li><a href="{{link}}"><img src="{{image}}" /><span class="colorhover"></span></a></li>',
        target: 'instafeed',
        limit: 6,
        resolution: 'standard_resolution'
    });
    userFeed.run();
}
    

$('.tweet').twittie({
            dateFormat: '%b %d, %Y',
            template: '<div class="date">{{date}}</div> {{tweet}}',
            count: 1,
            loadingText: 'Loading...'
        });
        
        
        


/* css-tricks.com/equal-height-blocks-in-rows
*/

equalheight = function(container){

var currentTallest = 0,
     currentRowStart = 0,
     rowDivs = new Array(),
     $el,
     topPosition = 0;
     
 if (screen.width > 480) {
 $(container).each(function() {

   $el = $(this);
   $($el).height('auto')
   topPostion = $el.position().top;

   if (currentRowStart != topPostion) {
     for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
       rowDivs[currentDiv].height(currentTallest);
     }
     rowDivs.length = 0; // empty the array
     currentRowStart = topPostion;
     currentTallest = $el.height();
     rowDivs.push($el);
   } else {
     rowDivs.push($el);
     currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
  }
   for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
     rowDivs[currentDiv].height(currentTallest);
   }
 });
}
}


$(window).resize(function(){
  equalheight('.feeds .equalheight');
});




jQuery("#flickrset").nanoGallery({
        kind: 'flickr',
        userID: '11068455@N03',
        photoset:'72157631907135979',
        thumbnailWidth: 'auto',
        thumbnailHeight: 426,
        theme: 'light',
        photoSorting: 'random72',
        viewerToolbar: { display: false },
      thumbnailGutterWidth: 1,
      thumbnailGutterHeight: 1,
      thumbnailHoverEffect: [{ name: 'labelAppear75', easing: 'swing', duration: 200 }],
      thumbnailLabel: { display: true, hideIcons: true, displayDescription: false, position: 'overImageOnMiddle', align: 'center' },
      locationHash: false,
      imageTransition: 'fade',
	  touchAnimation: false
    });
    
    
    
if($('#particles-js').length) {
particlesJS("particles-js", {"particles":{"number":{"value":64,"density":{"enable":true,"value_area":320}},"color":{"value":"#ccc5a3"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.9,"random":true,"anim":{"enable":true,"speed":1,"opacity_min":0.2,"sync":false}},"size":{"value":2.5,"random":true,"anim":{"enable":false,"speed":2,"size_min":0.1,"sync":false}},"line_linked":{"enable":false,"distance":200,"color":"#d9d5c3","opacity":0.4970562445196042,"width":1},"move":{"enable":true,"speed":2,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"repulse"},"onclick":{"enable":false,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});
}



$(function() {
		$('#content').SecretNav({
			navSelector: '#nav',
			openSelector: '.open-nav-menu',
			position: 'left'
		});
	});





}); // end documentready


  


$(window).load(function() {

equalheight('.feeds .equalheight');

//BX Slider
$('.bxslider').bxSlider({
	controls: false,
	mode: 'fade',
	speed: 400,
	pagerCustom: '#bx-pager',
	infiniteLoop: false,
	easing: 'swing',
	touchEnabled: false
});


//Waypoint Scrollfade    
$(document.getElementsByClassName('scrollfade'))
  .waypoint(function(direction) {
    if (direction === 'down') {
      $(this.element).addClass('animated fadeInUp');
      $(this.element).removeClass('scrollfade');
      $(this.element).css('opacity', 1);
    }
    
  }, {
    offset: '92%'
  })
  
  
$(document.getElementsByClassName('scrollbounce'))
  .waypoint(function(direction) {
    if (direction === 'down') {
      $(this.element).addClass('animated bounceIn')
      $(this.element).removeClass('scrollfade');
      $(this.element).css('opacity', 1);
    }
    
  }, {
    offset: '92%'
  })


});