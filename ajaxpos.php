<?php
require "libpos.php";
if (isset($_POST["req"])) { switch ($_POST["req"]) {
  // (A) CHECK LAST UPDATE
  case "check":
    echo POS_UPDATE;
    break;

  // (B) GET ALL ITEMS
  case "getAll":
    echo json_encode($_POS->getAll());
    break;

  // (C) CHECKOUT ORDER
  case "checkout":
    echo $_POS->checkout($_POST["items"], $_POST["total"], $_POST["timestamp"])
      ? "itworks" : $_POS->error ;
    break;
}}