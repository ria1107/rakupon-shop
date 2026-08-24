/* ==========================================================================
   らくぽん LP — main.js
   1. 在庫切れ商品の表示切替(SOLD_OUT_PRODUCTS に商品IDを追加するだけで反映)
   2. 「購入する」ボタンのGA4クリック計測(purchase_click)
   3. Square決済リンクが未設定(#TODO_...)の間はクリックしても遷移しない安全策
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------
     ① 在庫切れ商品の設定
     売り切れにしたい商品の product-card の data-product 値をここに追加する。
     例: ['sexypink'] とすると sexypink カードが自動で「売り切れ」表示になる。
     商品IDは index.html 側の data-product 属性(sexypink / mojitogreen / ink)と一致させること。
     -------------------------------------------------------------------- */
  var SOLD_OUT_PRODUCTS = [];

  function applySoldOutState() {
    var cards = document.querySelectorAll(".product-card[data-product]");
    cards.forEach(function (card) {
      var product = card.getAttribute("data-product");
      if (SOLD_OUT_PRODUCTS.indexOf(product) === -1) {
        return;
      }
      card.classList.add("is-soldout");

      var badge = card.querySelector(".soldout-badge");
      if (badge) {
        badge.style.display = "inline-block";
      }

      var btn = card.querySelector(".buy-button");
      if (btn) {
        btn.setAttribute("aria-disabled", "true");
        btn.classList.add("is-disabled");
        btn.removeAttribute("href");
        btn.textContent = "売り切れ";
      }
    });
  }

  /* --------------------------------------------------------------------
     ② 購入ボタンのクリック計測(GA4: purchase_click イベント)
        + Square決済リンクが未設定の間の安全策
     -------------------------------------------------------------------- */
  function bindBuyButtons() {
    var buttons = document.querySelectorAll(".buy-button[data-gtm-event]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        var product = btn.getAttribute("data-product") || "unknown";
        var price = btn.getAttribute("data-price") || "";
        var eventName = btn.getAttribute("data-gtm-event") || "purchase_click";

        // GA4イベント送信(gtag.js が読み込まれている場合のみ)
        if (typeof window.gtag === "function") {
          window.gtag("event", eventName, {
            item_name: product,
            value: price ? Number(price) : undefined,
            currency: "JPY"
          });
        }

        var href = btn.getAttribute("href") || "";
        if (href.indexOf("#TODO_SQUARE_PAYMENT_LINK") === 0) {
          // Square決済リンクがまだ発行されていない状態。誤って#へ遷移しないようにする。
          event.preventDefault();
          window.alert(
            "只今準備中です。Square決済リンクの発行後にご購入いただけるようになります。"
          );
        }
        // 実際のSquare決済リンクが設定されていれば、通常どおりそのURLへ遷移する。
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applySoldOutState();
    bindBuyButtons();
  });
})();
