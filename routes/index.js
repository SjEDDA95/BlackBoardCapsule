var express = require('express');
var router = express.Router();

var articleModel = require('../models/articles')
var orderModel = require('../models/orders')
var userModel = require('../models/users')

/* GET home page. */
router.get('/', async function (req, res, next) {

  var emptyStocks = await articleModel.find({ stock: 0 })

  var user = await userModel.findById('5c52e4efaa4beef85aad5e52');
  var messages = user.messages;

  var unreadMessages = 0;
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].read == false) {
      unreadMessages += 1
    }
  }

  var taches = user.tasks;
  var taskInprogress = 0

  for (var i = 0; i < taches.length; i++) {
    if (taches[i].dateCloture == null) {
      taskInprogress += 1;
    }
  }

  res.render('index', { emptyStocks: emptyStocks.length, unreadMessages, taskInprogress });
});

/* GET tasks page. */
router.get('/tasks-page', async function (req, res, next) {

  var user = await userModel.findById('5c52e4efaa4beef85aad5e52');
  res.render('tasks', { taches: user.tasks });
});

/* GET Messages page. */
router.get('/messages-page', async function (req, res, next) {

  var user = await userModel.findById('5c52e4efaa4beef85aad5e52');

  res.render('messages', { messages: user.messages });
});

/* GET Users page. */
router.get('/users-page', async function (req, res, next) {

  var users = await userModel.find({ status: "customer" });

  res.render('users', { users });
});

/* GET Catalog page. */
router.get('/catalog-page', async function (req, res, next) {

  var articles = await articleModel.find();

  res.render('catalog', { articles });
});

/* GET Orders-list page. */
router.get('/orders-list-page', async function (req, res, next) {

  var orders = await orderModel.find();

  res.render('orders-list', { orders });
});

/* GET Order detail page. */
router.get('/order-page', async function (req, res, next) {

  var order = await orderModel.findById(req.query.id)
    .populate('articles')
    .exec();

  res.render('order', { order });
});

/* GET chart page. */
router.get('/charts', async function (req, res, next) {
  var users = await userModel.find();

  var numMale = 0;
  var numFemale = 0;
  // Décompte du nombre d'utilisateurs par genre (sans agrégation)
  for (var i = 0; i < users.length; i++) {
    if (users[i].gender == 'male') {
      numMale++;
    } else {
      numFemale++;
    }
  }
  // Décompte du nombre d'utilisateurs par genre (avec agrégation)
  // var genderAggr = userModel.aggregate();
  // genderAggr.match({ "status": "customer" });
  // genderAggr.group({ _id: "$gender", totalUsers: { $sum: 1 } });
  // var genderData = await genderAggr.exec();
  // numMale = genderData.find(e => e._id === 'male').totalUsers;
  // numFemale = genderData.find(e => e._id === 'female').totalUsers;

  var user = await userModel.findById('5c52e4efaa4beef85aad5e52');
  var messages = user.messages;
  var messNonLu = 0;
  var messLu = 0;
  // Décompte du nombre de messages lus et non lus (sans agrégation)
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].read == false) {
      messNonLu += 1
    } else {
      messLu += 1
    }
  }
  // Décompte du nombre de messages lus et non lus (avec agrégation)
  // var messagesAggr = userModel.aggregate();
  // messagesAggr.match({ "status": "admin" });
  // messagesAggr.unwind("messages"); // Permet de "détacher" le tableau de sous-document messages
  // messagesAggr.group({ _id: "$messages.read", count: { $sum: 1 } });
  // var messagesData = await messagesAggr.exec();
  // messNonLu = messagesData.find(e => e._id === false).count;
  // messLu = messagesData.find(e => e._id === true).count;

  var orders = await orderModel.find({ status_payment: "validated" });
  var nbExp = 0;
  var nbNonExp = 0;
  // Décompte du nombre de commandes expédiées et non expédiées (sans agrégation)
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].status_shipment == true) {
      nbExp++
    } else {
      nbNonExp++
    }
  }
  // Décompte du nombre de commandes expédiées et non expédiées (avec agrégation)
  // var expAggr = orderModel.aggregate();
  // expAggr.match({ "status_payment": "validated" });
  // expAggr.group({ _id: "$status_shipment", count: { $sum: 1 } });
  // var expData = await expAggr.exec();
  // nbExp = expData.find(e => e._id === true).count;
  // nbNonExp = expData.find(e => e._id === false).count;

  var aggr = orderModel.aggregate()
  aggr.match({ status_payment: "validated" });
  aggr.group({ _id: { year: { $year: '$date_insert' }, month: { $month: '$date_insert' } }, CA: { $sum: '$total' } });
  aggr.sort({ _id: 1 });
  var totalCAByMonth = await aggr.exec();

  res.render('charts', { numMale, numFemale, messLu, messNonLu, nbExp, nbNonExp, totalCAByMonth });
});



module.exports = router;
