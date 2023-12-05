window.onload = function () {
  var message= [],productIdSelected;
  messageOne = "";
  var coordinatesArray;
  var latitude, longitude;
  month = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEPT","OCT","NOV","DEC"];

  fetch("http://inec.sg/assignment/retrieve_records.php")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      message = data;
      updateDate();
      getData();
      li_onclick();
      find_map(event);
    });
  
  //Get the data from the message  
  function updateDate() {
    lastUpdate = new Date(message.last_update);
    amPMData = lastUpdate.getHours() < 12 ? "AM" : "PM";
    lastUpdate = lastUpdate.getDate() + "-" + month[lastUpdate.getMonth()] + "-" +
                lastUpdate.getFullYear() + " " + lastUpdate.getHours() + ":" + lastUpdate.getMinutes() +
                " " + amPMData;
    document.getElementById("span_header_date").innerHTML = lastUpdate;
  }
  
  //Break up the fetch data
  function getData() {
    ul_list = document.querySelector("#ul_products_list");
    length = message.songs.length;
    for (var i = 0; i < length; i++) {
      li_list = document.createElement("li");
      li_list.className += "li_product_item";
      div_element = document.createElement("div");
      div_element.className += "li_product_image";
      img_element = document.createElement("img");
      img_element.src = message.songs[i].image;
      div_element.appendChild(img_element);
      div_element_text = document.createElement("div");
      div_element_text.className += "li_product_name";
      text = document.createTextNode(message.songs[i].name);
      span_element = document.createElement("span");
      span_element.className += "li_product_duration";
      text_two = document.createTextNode(
        message.songs[i].duration + " minutes"
      );
      span_element.appendChild(text_two);
      div_element_text.appendChild(text);
      br_element = document.createElement("br");
      div_element_text.appendChild(br_element);
      div_element_text.appendChild(span_element);
      li_list.appendChild(div_element);
      li_list.appendChild(div_element_text);
      ul_list.appendChild(li_list);
    }
  }
  
  //Breakup the song track into the detail slot
  function li_onclick() {
    list_of_records = document.getElementById("div_products_list");
    list_of_records.onclick = function (event) {
      span_element = [];
      messageOne = event.target.textContent;
      messageOne = messageOne.match(/[^0-9]/g).toString();
      messageOne = messageOne.replaceAll(",", "");
      messageOne = messageOne.substring(0, messageOne.indexOf("minutes") - 1);
      for (var i = 0; i < message.songs.length; i++) {
        if (messageOne.indexOf(message.songs[i].name) != -1) {
          img_element = document.getElementById("div_product_details_img");
          img = img_element.firstElementChild;
          img.src = message.songs[i].image;
          span_element = document.querySelectorAll(
            ".product_details_data_name"
          );
          span_element[0].nextSibling.nextSibling.textContent =
            message.songs[i].artist;
          span_element[1].nextSibling.nextSibling.textContent =
            message.songs[i].type;
          span_element[2].nextSibling.nextSibling.textContent =
            message.songs[i].release.charAt(0).toUpperCase() +
            message.songs[i].release.substring(1);
          span_element[3].nextSibling.nextSibling.textContent =
            message.songs[i].duration;
        }
      }
    };
  }
  
  //Get the current position and display the map
  function find_map(event) {
    click_map = document.getElementById("div_product_details_footer");
    click_map.onclick = function (event) {
      navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        calling_googleMap();
      });
    };
  }
  
  //Display the map and get the marker
  function calling_googleMap() {
    var mapProp = new google.maps.Map(
      document.getElementById("div_product_map"),
      {
        center: { lat: latitude , lng: longitude },
        zoom: 15,
      }
    );
    
    //Check if local storage exist
    if (localStorage["products"]) {
      coordinatesArray = JSON.parse(localStorage["products"]);
      } 
    else {
      coordinatesArray = [];
    }
    
    //Use click event to add the marker
    mapProp.addListener("click", function (event) {
      marker = new google.maps.Marker({
        position: event.latLng,
        map : mapProp,
      });
      
      //Store the marker in a localStorage
      emptyArray = {};
      emptyArray.id = messageOne;
      emptyArray.position = event.latLng;
      coordinatesArray.push(emptyArray);
      localStorage["products"] = JSON.stringify(coordinatesArray);
    });
    
    //Display the marker
    for(var i=0; i<coordinatesArray.length; i++){
      if(coordinatesArray[i].id===messageOne){
        new google.maps.Marker({
          position: coordinatesArray[i].position,
          map:mapProp,
    })}
  }
  }
  
  //Check whether service worker is supported by the web browser
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported");
  } else {
    navigator.serviceWorker
      .register("/serviceWork.js")
      .then(function () {
        console.log("Registered Service Worker.");
      })
      .catch(function () {
        console.log("Failure in Registering Service Worker.");
      });
  }
  
  //function to convert from Base64 URL-safe encoded to Int8Array
  function convert(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const appServerPublicKey =
    "BEI-fsSQvH0x89HX2MfnZkUL0Co2q2Jfv5horD43OUaKwx3R-EiK7EMsWOdN4jB4F7gKlQS_HUbF3VpukGuy05U";

  const appServerPrivateKey = "QmSmHxwMjWxgefD7IXdPLbrI4yDWVFjImrXhcmfRMe0";
  
  //Check to see Service Worker is ready
  navigator.serviceWorker.ready.then(function (registration) {
    registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: convert(appServerPublicKey),
      })
      .then(function (subscription) {
        console.log(JSON.stringify(subscription));
        //send the subscription to server side for storage
      })
      .catch(function (error) {
        console.log(error);
      });
  });
};
