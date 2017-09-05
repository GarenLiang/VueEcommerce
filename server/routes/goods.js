var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

mongoose.connect('mongodb://127.0.0.1:27017/vueecommerce');

mongoose.connection.on("connected", function() {
  console.log("mongodb success");
});

mongoose.connection.on("error", function() {
  console.log("mongodb connect fail");
});

mongoose.connection.on("disconnected", function() {
  console.log("mongodb disconnect");
});

router.get("/list", function(req, res, next) {
  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let priceLevel = req.param("priceLevel");
  let sort = req.param("sort");
  let skip = (page-1)*pageSize;
  var priceGt = '',priceLte = '';
  let params = {};
  if(priceLevel!='all'){
    switch (priceLevel){
      case '0':priceGt = 0;priceLte=100;break;
      case '1':priceGt = 100;priceLte=500;break;
      case '2':priceGt = 500;priceLte=1000;break;
      case '3':priceGt = 1000;priceLte=5000;break;
    }
    params = {
      salePrice:{
        $gt:priceGt,
        $lte:priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec(function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      });
    }
  })
});

//加入到购物车
router.post("/addCart", function (req,res,next) {
  var userId = '100000077',productId = req.body.productId;
  var User = require('../models/user');
  User.findOne({userId:userId}, function (err,userDoc) {
    if(err){
        res.json({
            status:"1",
            msg:err.message
        })
    }else{
    //  如果查到此用户
        if(userDoc){
          var goodsItem = '';
          // 加入购物车中的商品是否已经存在于购物车中
          userDoc.cartList.forEach(function (item) {
            // 如果存在，给数量+1
              if(item.productId == productId){
                goodsItem = item;
                item.productNum ++;
              }
          });
            // 存在的情况，数量加一以后
          if(goodsItem){
            userDoc.save(function (err2,doc2) {
              if(err2){
                res.json({
                  status:"1",
                  msg:err2.message
                })
              }else{
                res.json({
                  status:'0',
                  msg:'',
                  result:'suc'
                })
              }
            })
            // 如果购物车中之前不存在此商品
          }else{
            Goods.findOne({productId:productId}, function (err1,doc) {
              if(err1){
                res.json({
                  status:"1",
                  msg:err1.message
                })
              }else{
                if(doc){
                  // 把返回的商品数据 添加 productNum,checked两个元素
                  //  商品结构中必须存在这两个定义，否则添加不进去
                  doc.productNum = 1;
                  doc.checked = 1;
                  console.log(doc)
                  userDoc.cartList.push(doc);
                  userDoc.save(function (err2,doc2) {
                    if(err2){
                      res.json({
                        status:"1",
                        msg:err2.message
                      })
                    }else{
                      res.json({
                        status:'0',
                        msg:'',
                        result:'suc'
                      })
                    }
                  })
                }
              }
            });
          }
        }
    }
  })
});
module.exports = router;
