/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

var applicationServerPublicKey = '<Your Public Key>';
var pushButton = document.querySelector('.js-push-btn');
var isSubscribed = false;
var swRegistration = null;

// 서비스워커 지원여부 파악 및 등록
if('serviceWorker' in navigator && 'PushManager' in window){
  navigator.serviceWorker.register('sw.js').then(function(swReg){
    console.log('Service Worker is registered', swReg);
    swRegistration = swReg;
    initialiseUI();
  }).catch(function(err){
    console.error('서비스워커 등록오류', err);
  })
}


// 해당 브라우저의 푸시 메시지 등록 여부 확인 (구독권)
function initialiseUI() {
  //푸시 버튼 이벤트 추가
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unSubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // 서비스워커의 푸시 매니저가 푸시를 허용하고 있는지 확인하는 코드
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }
    // 푸시 등록 여부를 파악하는 UI 코드
    updateBtn();
  });
}

// 푸시 등록 여부를 파악하는 UI 코드
function updateBtn() {
  // 푸시 알람이 차단되어 있는지 확인
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  // 푸시 메시지 허용 여부에 따라서 버튼의 텍스트 조정
  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  swRegistration.pushManager.subscribe({
    // 푸시 수신 시 알람 표시 속성
    userVisibleOnly: true
  })
  .then(function(subscription) {
    console.log('User is subscribed:', subscription);
    isSubscribed = true;

    updateSubscriptionOnServer(subscription);
    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unSubscribeUser() {
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    subscription.unsubscribe().then(function(successful) {
      console.log('User is unsubscribed : ', successful);
      console.log('Unsubscribed subscription : ', subscription);

      updateSubscriptionOnServer(subscription, successful);
      isSubscribed = false;

      updateBtn();
    }).catch(function(e) {
      console.log('Failed to unsubscribe the user: ', e);
      updateBtn();
    })
  });
}

function updateSubscriptionOnServer(subscription, unsubscribed) {
  var subscriptionJson = document.querySelector('.js-subscription-json');
  var subscriptionDetails = document.querySelector('.js-subscription-details');

  if (subscription && !unsubscribed) {
    sendDeviceKeytoFirebase(subscription.endpoint.split('send/')[1]);
    alert('구독이 수신됨');
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    removeDeviceKeyinFirebase(subscription.endpoint.split('send/')[1]);
    alert('구독이 해지됨');
    subscriptionDetails.classList.add('is-invisible');
  }
}
