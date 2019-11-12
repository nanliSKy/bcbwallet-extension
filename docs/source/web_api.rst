.. _header-n17655:

window.bcbWeb
=============

此模块提供BCB钱包Web接口。

.. _header-n17658:

类型
----

.. _header-n17659:

Account
~~~~~~~

======= ====== ========
属性    类型   描述
======= ====== ========
address string 账户地址
name    string 账户名
======= ====== ========

.. _header-n17673:

Chain
~~~~~

======= ====== ====
属性    类型   描述
======= ====== ====
network string 网络
chain   string 链
======= ====== ====

.. _header-n17687:

ContractCall
~~~~~~~~~~~~

======== ========= ============
属性     类型      描述
======== ========= ============
contract string    合约地址
method   string    合约方法原型
params   object [] 合约方法参数
======== ========= ============

-  合约方法原型格式

.. code:: 

   FuncName(ParamType1,ParamType2...)ReturnType

原型使用golang语法，不允许空格。

-  合约方法参数格式

.. code:: 

   [ arg1, arg2... ]

arg1为ParamType1类型编码，arg2为ParamType2类型编码。

-  参数编码格式

============= ====== ====================================================================
类型          JSON   示例
============= ====== ====================================================================
string        string "bcbwallet"
[]byte        string "bcbwallet"
types.Address string "bcbtest9agiEGfqASERLuGv9Ytqn5XhfiEP3Zzsu"
types.Pubkey  string "0xdc6b51f210b4016bb18001c06b5202cddf675ffa00ff5b3ca114c7e060578ee0"
types.Number  string "1000", "1000000000000000.123"
int/uint      string "1000"
bool          string "true", "false"
[]            []     []string: ["a", "b", "c"], []int: ["1", "2", "3"]
============= ====== ====================================================================

.. _header-n17755:

Transaction
~~~~~~~~~~~

======== ==================================== =========================================================
属性     类型                                 描述
======== ==================================== =========================================================
version  number                               **可选**\ 。网络主版本，默认为2
note     string                               交易备注
nonce    string                               **可选**\ 。账户nonce，默认从网络查询
gasLimit string                               允许消耗的gas量
calls    `ContractCall <#header-n17687>`__ [] 合约方法调用体。当前允许在一次交易中最多调用2个合约方法。
======== ==================================== =========================================================

.. _header-n17781:

属性
----

.. _header-n17782:

ready
~~~~~

boolean ``window.bcbWeb.ready``

===== ========================
定义 
===== ========================
true  钱包已解锁
false 钱包未解锁，或未创建钱包
===== ========================

.. _header-n17794:

selectedAccount
~~~~~~~~~~~~~~~

`Account <#header-n17659>`__ ``window.bcbWeb.selectedAccount``

.. _header-n17796:

selectedChain
~~~~~~~~~~~~~

`Chain <#header-n17673>`__ ``window.bcbWeb.selectedChain``

.. _header-n17798:

方法
----

事件方法需传入callback。
其他方法可接受callback，若不传入callback，会转成Promise。

callback使用Node.js风格callback(err, result) { }。

以\ ``getBalance``\ 为例

-  callback方式

.. code:: javascript

   // callback
   function cb(err, result) {
       if (err) console.error(err)
       console.log(result)
   }
   // 传入callback
   window.bcbWeb.getBalance(tokenAddress, cb)

-  Promise方式

.. code:: javascript

   // 没有传入callback，返回一个promise
   let balancePromise = window.bcbWeb.getBalance(tokenAddress)
   balancePromise.then(balance => {
   	console.log(balance)
   }).catch(err => {
   	console.error(err)
   })

.. _header-n17810:

onStateChanged
~~~~~~~~~~~~~~

钱包状态改变时触发。

**语法**

.. code:: javascript

   window.bcbWeb.onStateChanged(function callback)

**参数**

``callback``

function类型。事件到来时，一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``ready``

   boolean类型。同\ `ready <#header-n17782>`__\ 属性。

**返回**

undefined。

**示例**

.. code:: javascript

   window.bcbWeb.onStateChanged(ready => {
   	console.log(ready)
   })

.. _header-n17825:

onAccountChanged
~~~~~~~~~~~~~~~~

选择的账户改变时触发。

**语法**

.. code:: javascript

   window.bcbWeb.onAccountChanged(function callback)

**参数**

``callback``

function类型。事件到来时，一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``account``

   `Account <#header-n17659>`__\ 类型。

**返回**

undefined。

**示例**

.. code:: javascript

   window.bcbWeb.onAccountChanged(account => {
   	console.log(account)
   })

.. _header-n17840:

onChainChanged
~~~~~~~~~~~~~~

选择的链改变时触发。

**语法**

.. code:: javascript

   window.bcbWeb.onChainChanged(function callback)

**参数**

``callback``

function类型。事件到来时，一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``chain``

   `Chain <#header-n17673>`__\ 类型。

**返回**

undefined。

**示例**

.. code:: javascript

   window.bcbWeb.onChainChanged(chain => {
   	console.log(chain)
   })

.. _header-n17855:

getBalance
~~~~~~~~~~

查询当前账户代币余额。

**语法**

.. code:: 

   getBalance(string tokenAddress, function callback)

**参数**

``tokenAddress``

string类型。代币地址。

``callback`` \| 可选

function类型 。一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``balance``

   number类型。账户余额，单位为最小单位，由代币定义。

**返回**

若不传入callback，返回promise。 否则，返回undefined。

**示例**

.. code:: javascript

   window.bcbWeb.getBalance('devtestKpSAocBacESGWjvuncn4oAjADbX22Sqit')
   .then(console.log)
   .catch(console.error)

.. _header-n17872:

getBalanceBySymbol
~~~~~~~~~~~~~~~~~~

查询当前账户代币余额。

**语法**

.. code:: 

   getBalanceBySymbol(string tokenSymbol, function callback)

**参数**

``tokenSymbol``

string类型。代币符号，不区分大小写。

``callback`` \| 可选

function类型 。一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``balance``

   number类型。账户余额，单位为最小单位，由代币定义。

**返回**

若不传入callback，返回promise。 否则，返回undefined。

**示例**

.. code:: javascript

   // Symbol不区分大小写
   window.bcbWeb.getBalanceBySymbol('DC')
   .then(console.log)
   .catch(console.error)

   window.bcbWeb.getBalanceBySymbol('dc')
   .then(console.log)
   .catch(console.error)

.. _header-n17889:

sendTransaction
~~~~~~~~~~~~~~~

发送交易

**语法**

.. code:: javascript

   sendTransaction(Transaction transaction, function callback)

**参数**

``transaction``

`Transaction <#header-n17755>`__\ 类型。

``callback`` \| 可选

function类型 。一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``hash``

   *string*\ 类型。发送成功返回交易hash，hex编码。

**返回**

若不传入callback，返回promise。 否则，返回undefined。

**示例**

.. code:: javascript

   let transaction = {
       // "version": 2,  // 如果一定要发送BCB 1.0时代的交易，此处填1，默认为2
       "note": "haha",
       "gasLimit": "25000",
       "calls": [{
           // 转账合约
           "contract": "bcbtestAtEJ4dTejwJReKA4dtFjy9cQ3HzR6jbwF",
           "method": "Transfer(types.Address,bn.Number)",
           "params": ["bcbtest9agiEGfqASERLuGv9Ytqn5XhfiEP3Zzsu", "1000000"]
       },
       {
           // 转账合约
           "contract": "bcbtestAtEJ4dTejwJReKA4dtFjy9cQ3HzR6jbwF",
           "method": "Transfer(types.Address,bn.Number)",
           "params": ["bcbtestKh7voAEoJ2mVmL19xNLjLgbeakxpryqJx", "2000000"]
       }]
   };

   window.bcbWeb.sendTransaction(transaction).then((hash) => {
       console.log(hash);
   }).catch((err) => {
       console.error(err)
   })

.. _header-n17906:

signTransaction
~~~~~~~~~~~~~~~

构造交易并签名。

**语法**

.. code:: javascript

   signTransaction(Transaction transaction, function callback)

**参数**

``transaction``

`Transaction <#header-n17755>`__\ 类型。

``callback`` \| 可选

function类型 。一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``signedTransaction``

   string类型。签名后的交易数据，可广播到网络。

**返回**

若不传入callback，返回promise。 否则，返回undefined。

**示例**

.. code:: javascript

   let transaction = {
       // "version": 2,  // 如果一定要发送BCB 1.0时代的交易，此处填1，默认为2
       // "nonce": "100", // 指定nonce，不指定则从节点查询
       "note": "haha",
       "gasLimit": "25000",
       "calls": [{
           // 转账合约
           "contract": "bcbtestAtEJ4dTejwJReKA4dtFjy9cQ3HzR6jbwF",
           "method": "Transfer(types.Address,bn.Number)",
           "params": ["bcbtest9agiEGfqASERLuGv9Ytqn5XhfiEP3Zzsu", "1000000"]
       },
       {
           // 转账合约
           "contract": "bcbtestAtEJ4dTejwJReKA4dtFjy9cQ3HzR6jbwF",
           "method": "Transfer(types.Address,bn.Number)",
           "params": ["bcbtestKh7voAEoJ2mVmL19xNLjLgbeakxpryqJx", "2000000"]
       }]
   };

   window.bcbWeb.signTransaction(transaction).then((signedTransaction) => {
       console.log(signedTransaction);
   }).catch((err) => {
       console.error(err)
   })

.. _header-n17924:

signMessage
~~~~~~~~~~~

签名数据，返回签名和公钥。

**语法**

.. code:: javascript

   signMessage(string message, function callback)

**参数**

``message``

string类型。hex编码。

``callback`` \| 可选

function类型 。一个回调方法将被执行。\ ``callback``\ 参数如下

-  ``result``

   object类型。定义如下

========= ======== =============
属性      类型     描述
========= ======== =============
signature *string* 签名，hex编码
pubkey    *string* 公钥，hex编码
========= ======== =============

**返回**

若不传入callback，返回promise。 否则，返回undefined。

**示例**

.. code:: javascript

   let message = '0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0'window.bcbWeb.signMessage(message).then((result) => {
       let {
           signature,
           pubkey
       } = result;
       // hex
       console.log('signature: ', signature);
       // hex
       console.log('pubkey: ', pubkey);
   }).catch((err) = >{
       console.error(err)
   })
