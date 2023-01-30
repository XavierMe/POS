var cart = {
  items : {}, 
  total : 0, 

  save : () => localStorage.setItem("PRPPOS", JSON.stringify(cart.items)),

  load : () => {
    cart.items = localStorage.getItem("PRPPOS");
    if (cart.items==null) { cart.items = {}; }
    else { cart.items = JSON.parse(cart.items); }
  },

  draw : () => {
    cart.total = 0;

    if (Object.keys(cart.items).length === 0) {pos.mycart.innerHTML =  `Sell Something Bozo`;}
    
    else {
      pos.mycart.innerHTML = "";

      let item;
      for (let [id, qty] of Object.entries(cart.items)) {
        let itotal = pos.items[id]["item_price"] * qty;
        cart.total += itotal;
        item = document.createElement("div");
        item.className = "Cart-Items";
        item.innerHTML = `
        <div class="cartitem">
        <h1 class="cartproduct">${pos.items[id]["item_name"]}</h1>
        <label class="qty">QTY: </label>
        <input maxlength="9" class="counter" onchange="cart.change(${id}, this.value)" value="${qty}">
        </div>
        <div class="prices">
        <h1 class="amount">$${itotal.toFixed(2)}</h1>
        <div class="delete" onclick="cart.change(${id}, 0)">Delete</div>
        </div>`
      pos.mycart.appendChild(item);
      }

      item = document.createElement("div");
      item.innerHTML = `
      <div class="carttotal">Total: $${cart.total.toFixed(2)}</div>`
      pos.mycart.appendChild(item);
    }
  },


  add : id => {
    if (cart.items[id]==undefined) { cart.items[id] = 1; }
    else { cart.items[id]++; }
    cart.save();
    cart.draw();
  },

  change : (id, qty) => {
    if (qty==0) { delete cart.items[id]; }
    else if (qty!="") { cart.items[id] = parseInt(qty); }
    cart.save();
    cart.draw();
  },

  empty : () => {
    cart.items = {};
    cart.save();
    cart.draw();
  },

  checkout : () => {
    let items = [];
    for (let [id, qty] of Object.entries(cart.items)) {
      items.push({
        n : pos.items[id]["item_name"],
        p : pos.items[id]["item_price"],
        q : qty
      });
    }

    pos.fetch("checkout", {
      items : JSON.stringify(items),
      total : cart.total.toFixed(2),
      timestamp : pos.updated
    }, res => {
      
  if (res=="itworks") {
        cart.empty();
      }
    });
  }
};