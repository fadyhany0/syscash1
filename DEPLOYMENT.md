# تعليمات النشر على GitHub Pages

## الخطوات السريعة

### 1. إنشاء مستودع جديد على GitHub
1. اذهب إلى GitHub.com
2. اضغط على "New repository"
3. اكتب اسم المستودع: `cashier-system`
4. اختر "Public"
5. اضغط "Create repository"

### 2. رفع المشروع إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cashier-system.git
git push -u origin main
```

### 3. تحديث package.json
تأكد من تحديث `homepage` في ملف `package.json`:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/cashier-system",
  ...
}
```

### 4. تثبيت gh-pages
```bash
npm install --save-dev gh-pages
```

### 5. إعداد GitHub Pages
1. اذهب إلى إعدادات المستودع على GitHub
2. انتقل إلى قسم "Pages"
3. اختر "Deploy from a branch"
4. اختر فرع `gh-pages`
5. اضغط "Save"

### 6. نشر المشروع
```bash
npm run deploy
```

## استكشاف الأخطاء

### المشكلة: الصفحة لا تظهر
- تأكد من أن المستودع public
- تحقق من إعدادات GitHub Pages
- انتظر بضع دقائق بعد النشر

### المشكلة: الروابط لا تعمل
- تأكد من تحديث `homepage` في package.json
- أعد بناء المشروع: `npm run build`
- أعد النشر: `npm run deploy`

### المشكلة: التطبيق لا يعمل
- تحقق من console المتصفح للأخطاء
- تأكد من أن جميع الملفات تم رفعها
- جرب حذف cache المتصفح

## روابط مفيدة

- [GitHub Pages Documentation](https://pages.github.com/)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [gh-pages Package](https://www.npmjs.com/package/gh-pages)

## ملاحظات مهمة

1. **اسم المستخدم**: استبدل `YOUR_USERNAME` باسم المستخدم الخاص بك على GitHub
2. **اسم المستودع**: يمكنك تغيير اسم المستودع، لكن تأكد من تحديث `homepage` في package.json
3. **الخصوصية**: المستودع يجب أن يكون public لكي يعمل GitHub Pages مجاناً
4. **التحديثات**: بعد كل تحديث، قم بتشغيل `npm run deploy` لنشر التحديثات

## بيانات الدخول الافتراضية

- **اسم المستخدم:** `markncode`
- **كلمة المرور:** `Markncode123`

---

**تم التطوير بواسطة:** MarknCode  
**تاريخ الإنشاء:** 2024

