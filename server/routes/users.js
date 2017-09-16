var express = require('express');
var router = express.Router();
require('./../util/util')
var User = require('./../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/test', function(req, res, next) {
  res.send('test');
});

router.post("/login", function (req,res,next) {
  var param = {
      userName:req.body.userName,
      userPwd:req.body.userPwd
  }
  User.findOne(param, function (err,doc) {
      if(err){
          res.json({
              status:"1",
              // msg:err.message
          });
      }else{
          if(doc){
            console.log(doc)
              res.cookie("userId",doc.userId,{
                  path:'/',
                  maxAge:1000*60*60
              });
              res.cookie("userName",doc.userName,{
                path:'/',
                maxAge:1000*60*60
              });
              //req.session.user = doc;
              res.json({
                  status:'0',
                  msg:'',
                  result:{
                      userName:doc.userName
                  }
              });
          }else{
            res.json({
              status:'1'
            })
          }
      }
  });
});

router.post("/logout", function (req,res,next) {
  res.cookie("userId","",{
    path:"/",
    maxAge:-1
  });
  res.json({
    status:"0",
    msg:'',
    result:''
  })
});
router.get("/checkLogin", function (req,res,next) {
  if(req.cookies.userId){
      res.json({
        status:'0',
        msg:'',
        result:req.cookies.userName || ''
      });
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    });
  }
});
router.get('/cartlist', function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
})

// 购物车删除
router.post('/cartDel',function(req,res,next){
  var userId=req.cookies.userId;
  var productId=req.body.productId;
  // 先根据cookie中的用户id查询用户，再根据前端传递来的商品id从购物车中找到并删除
  User.update({
    userId:userId
  },{
    $pull:{
      'cartList':{
        'productId':productId
      }
    }
  },function(err,doc){
    if(err){
      res.json({
          status: '1',
          msg: err.message,
          result: ''
      })
    }else{
      res.json({
          status: '0',
          msg: '',
          result:'success'
      })
    }
  }
)
})

router.post("/cartEdit", function (req,res,next) {
  var userId = req.cookies.userId,
         productId = req.body.productId,
         productNum = req.body.productNum,
         checked = req.body.checked;
  User.update({"userId":userId,"cartList.productId":productId},{
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked,
  },function(err, doc) {
    if(err){
      res.json({
          status: '1',
          msg: err.message,
          result: ''
      })
    }else{
      res.json({
          status: '0',
          msg: '',
          result:'success'
      })
    }
  })
});
router.post('/editCheckAll', function (req, res, next) {
  var userId = req.cookies.userId,
    checkAll = req.body.checkAll ? '1' : '0';
  User.findOne({
    userId: userId
  }, function (err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (user) {
        user.cartList.forEach((item) => {
          item.checked = checkAll;
        })
        user.save(function (err1, doc1) {
          if (err) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'success'
            })
          }
        })
      }

    }
  })

})

router.get('/addressList',function(req,res,next){
  var userId=req.cookies.userId;
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
       res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      })
    }
  })
});
router.post('/setDefault', function (req, res, next) {
  var userId = req.cookies.userId;
  var addressId = req.body.addressId;
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      var addressList = doc.addressList;
      addressList.forEach((item) => {
        if (item.addressId == addressId) {
          item.isDefault = true;
        } else {
          item.isDefault = false;

        }
      })
      doc.save(function (err1, doc1) {
        if (err) {
          res.json({
            status: '1',
            msg: err.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: ''
          })
        }
      })
    }
  })
})

router.post('/delAddress', function (req, res, next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId;
  User.update({
    userId: userId
  }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, function (err, doc) {
     if (err) {
          res.json({
            status: '1',
            msg: err.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: ''
          })
        }
  })
});
router.post('/payMent', function (req, res, next) {
  var userId = req.cookies.userId;
  // 插入数据库用到的
  // 前端传递
  var orderTotal = req.body.orderTotal;
  // 前端从地址参数中获取
  var addressId = req.body.addressId
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      // 一会插入数据库中额地址信息
      var address = '';
      var goodsList = [];

      // 获取当前用户的地址信息  判断用户所选择的地址
      doc.addressList.forEach((item) => {
        if (addressId == item.addressId) {
          address = item;
        }
      })
      // 获取用户购物车的购买商品
      doc.cartList.filter((item) => {
        if (item.checked == '1') {
          goodsList.push(item)
        }
      })

      //  创建日期
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')

      // 随机数
      var r1 = Math.floor(Math.random() * 10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      // 订单id
      var orderId = r1 + sysDate

      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      }
      doc.orderList.push(order);
      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: '1',
            msg: err.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      })

    }
  })
});
module.exports = router;
