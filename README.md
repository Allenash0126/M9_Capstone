# README
## 登入頁
<img width="1324" alt="SignInPage" src="https://github.com/Allenash0126/M9_Capstone/assets/150648641/a5a65e71-0928-4f4f-b470-dc03d90a66c2">

## 首頁
![HomePage](https://github.com/Allenash0126/M9_Capstone/assets/150648641/3dc09fa1-51bf-4097-8f0d-3b27d652f7fe)

## 簡介
* 這是一個英文家教媒合平台
* 學生：可透過課程的介紹與風格、同儕的過往評論與歷史評分等, 找到最適合自己的老師
* 老師：可藉由選擇每週適合的時段, 不論是想從事正職或兼差的英文老師, 都可以在此平台找到學生

## 功能
* 註冊、登入與登出功能、並提供Facebook帳號登入
* 首頁：
  * 可瀏覽所有老師的課程, 包含姓名、國家、簡介等
  * 也提供搜尋老師姓名的功能、底部的分頁器會隨著搜尋結果變化
  * 側欄位提供了學習總時數的排名, 包含學生的大頭貼、姓名與總時數等
* 學生：
  * 點擊個人名字：可進入個人頁面
  * 個人資料：可編輯姓名、自我介紹、大頭貼等
  * New Schedule: 可顯示個人近兩週的課程預約狀況, 包含時間、老師姓名、上課連結
  * Lesson History：可查看＆編輯過往的課程評分、評論
  * Achievement：可查看已上過的課程總時數、以及累計排名
* 老師：
  * 點擊成為老師：填寫必要資料即可註冊成為老師, 包含教學介紹、教學風格、開放預約的時間
  * 點擊個人名字或Profile：可進入老師個人頁面
  * 個人資料：可編輯姓名、自我介紹、大頭貼等
  * New Schedule: 可看到近期的預約狀況
  * Recent Review：可看到近期學生的回饋、包含分數與評論
  * 點擊Edit Profile & Booking Calendar: 可重新選擇上課時段
  * 「優化儲存空間」：當submit後, 除自動更新課程外、還同步刪除過往學生未預約的課程, 避免資料無限成長, 可提升管理資料儲存空間
* 管理者
  * User List: 瀏覽全站所有人的姓名與ID, 包含學生與老師
  * Time List: 可新增或刪除網站上的課程時段、未來不受限於目前的18:00-21:00, 隨時「保有擴充的權利與彈性」

## 開始使用
* 本機安裝node.js 與 npm
* 複製專案到本機：
```bash
https://github.com/Allenash0126/M9_Capstone.git
```
* 進入專案資料夾：
```bash
cd online-tutors
```
* 下載相關套件：
  * 如下方開發工具
* 建立.env檔案並填入相關資料
  * 參考.env example檔案
* 建立temp資料夾
* 設定MySQL資料庫：
  * username, password與專案config/config.json中的development相同
* 建立資料庫資料表：
```bash
npx sequelize db:migrate
```
* 建立種子資料：
```bash
npx sequelize db:seed:all
```
* 啟動專案：
```bash
npm run dev
```
* 看到：It is running on server http://localhost:3000, 代表伺服器啟動, 請至下列網址查看
```bash
http://localhost:3000
```

## 種子資料
* 身份(1): 學生
  * email: user1@example.com 
  * password: 12345678
  * 數量: 5位 (user1 ~ user5)
* 身份(2): 老師
  * email: teacher1@example.com 
  * password: 12345678
  * 數量: 10位 (teacher1 ~ teacher10)
* 身份(3): 管理者
  * email: root@example.com
  * password: 12345678
  * 數量：1位

## 開發工具：
* bcryptjs: 2.4.3
* connect-flash: 0.1.1
* dayjs: 1.11.10
* dotenv: 16.4.5
* express: 4.19.2
* express-handlebars: 7.1.2
* express-session: 1.17.2
* faker: 5.5.3
* method-override: 3.0.0
* multer: 1.4.5-lts.1
* mysql2: 3.2.0
* passport: 0.4.1
* passport-facebook: 3.0.0
* passport-local: 1.0.0
* sequelize: 6.6.5
* sequelize-cli: 6.6.0

