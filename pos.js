var pos = {
  ItemName : "POS", 
  iDB : null, iTX : null,
  updated : null, 
  items : null, 
  thelist : null, 
  mycart : null, 

  fetch : (req, data, after) => {
    let form = new FormData();
    form.append("req", req);
    if (data != null) { for (let [k,v] of Object.entries(data)) {
      form.append(k, v);
    }}

    fetch("ajaxpos.php", { method: "post", body: form })
    .then(res => res.text())
    .then(txt => after(txt))
    .catch(err => console.error(err));
  },

  update : ts => pos.fetch("getAll", null, items => {
    pos.iTX().clear();

    items = JSON.parse(items);
    let count = 0;
    for (let i of items) {
      let req = pos.iTX().put(i);
      req.onsuccess = () => {
        count++;
        if (count==items.length) {
          localStorage.setItem("POSUpdate", ts);
          pos.draw(cart.empty);
        }
      };
    }
  }),

  init : () => {

    let req = window.indexedDB.open(pos.itemname, 1);

    req.onerror = evt => {
      alert("Indexed DB init error - " + evt.message);
      console.error(evt);
    };

    // (D4) UPGRADE NEEDED
    req.onupgradeneeded = evt => {
      // (D4-1) INIT UPGRADE
      pos.iDB = evt.target.result;
      pos.iDB.onerror = evt => {
        alert("Indexed DB upgrade error - " + evt.message);
        console.error(evt);
      };

      // (D4-2) VERSION 1
      if (evt.oldVersion < 1) {
        let store = pos.iDB.createObjectStore(pos.ItemName, { keyPath: "item_id" });
      }
    };

    // (D5) OPEN DATABASE 
    req.onsuccess = evt => {
      // (D5-1) REGISTER IDB OBJECTS
      pos.iDB = evt.target.result;
      pos.iTX = () => {
        return pos.iDB
        .transaction(pos.ItemName, "readwrite")
        .objectStore(pos.ItemName);
      };

      // (D5-2) GET HTML ELEMENTS
      pos.thelist = document.getElementById("list");
      pos.mycart = document.getElementById("cart");

      // (D5-3) LAST UPDATED - ITEMS
      pos.updated = localStorage.getItem("POSUpdate");
      if (pos.updated== null) { pos.updated = 0; }

      // (D5-4) CHECK SERVER FOR ITEM UPDATES
      pos.fetch("check", null, ts => {
        if (ts > pos.updated) { pos.update(ts); }
        else { pos.draw(() => { cart.load(); cart.draw(); }); }
      });
    };
  },

  // (E) GET & DRAW ITEMS
  draw : after => {
    let req = pos.iTX().getAll();
    req.onsuccess = () => {
      pos.thelist.innerHTML = "";
      pos.items = {};
      for (let i of req.result) {
        pos.items[i["item_id"]] = i;
        let item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `<div class="ItemName">${i["item_name"]}</div>
        <div class="itemprice">$${i["item_price"]}</div>`;
        item.onclick = () => { cart.add(i["item_id"]); };
        pos.thelist.appendChild(item);
      }
      if (after) { after(); }
    };
  }
};
window.onload = pos.init;