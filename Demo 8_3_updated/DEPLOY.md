# 🚀 Hướng Dẫn Deploy Lên GitHub Pages

## 🎯 Tại sao cần deploy?
Mã QR hiện tại đang trỏ đến đường dẫn cục bộ (`file:///...`) → Điện thoại không thể truy cập. Cần deploy lên hosting để có URL công khai.

## 📋 Cách 1: GitHub Pages (Miễn phí & Đơn giản nhất)

### Bước 1: Chuẩn bị
1. Tạo tài khoản GitHub tại [github.com](https://github.com)
2. Cài đặt Git trên máy tính (chưa có thì tải từ [git-scm.com](https://git-scm.com))

### Bước 2: Tạo Repository
1. Đăng nhập GitHub
2. Click "New" → Tạo repository mới
3. Đặt tên: `qua-8-3-cho-me` (hoặc tên bạn muốn)
4. Chọn "Public" (quan trọng!)
5. Click "Create repository"

### Bước 3: Upload code
#### Cách A: Dùng GitHub Desktop (dễ nhất)
1. Tải và cài đặt [GitHub Desktop](https://desktop.github.com)
2. Mở GitHub Desktop → "Add Existing Repository"
3. Chọn thư mục `D:\Demo 8_3`
4. Commit changes với message "Initial commit"
5. Push lên GitHub

#### Cách B: Dùng Git command
```bash
# Mở Command Prompt hoặc PowerShell
cd "D:\Demo 8_3"

# Khởi tạo git
git init
git add .
git commit -m "Initial commit"

# Thêm remote
git remote add origin https://github.com/username/qua-8-3-cho-me.git
git branch -M main
git push -u origin main
```

#### Cách C: Upload trực tiếp (nếu không dùng Git)
1. Vào repository trên GitHub
2. Click "Add file" → "Upload files"
3. Kéo thả tất cả file từ thư mục `Demo 8_3` vào
4. Commit changes

### Bước 4: Bật GitHub Pages
1. Vào repository → Settings
2. Kéo xuống mục "Pages" ở sidebar trái
3. Source: Chọn "Deploy from a branch"
4. Branch: Chọn "main"
5. Folder: Chọn "/ (root)"
6. Click "Save"

### Bước 5: Chờ và lấy URL
1. Chờ 2-5 phút để GitHub deploy
2. Quay lại Settings → Pages
3. URL sẽ là: `https://username.github.io/qua-8-3-cho-me/`

## 📱 Cách 2: Netlify (Siêu nhanh)

### Bước 1:
1. Vào [netlify.com](https://netlify.com)
2. Đăng ký tài khoản miễn phí

### Bước 2:
1. Click "Drag and drop your site output here"
2. Kéo thả cả thư mục `Demo 8_3` vào
3. Chờ vài giây → Done!

### Bước 3:
URL sẽ có dạng: `https://random-name-123.netlify.app`

## 🌐 Cách 3: Vercel

### Bước 1:
1. Vào [vercel.com](https://vercel.com)
2. Đăng ký bằng GitHub

### Bước 2:
1. Click "New Project"
2. Import repository GitHub
3. Deploy → Done!

## ✅ Kiểm tra sau khi deploy

1. **Mở URL công khai** trên trình duyệt máy tính
2. **Kiểm tra cả 2 trang:**
   - `https://your-url.com/` (trang mã QR)
   - `https://your-url.com/flower-bloom.html` (trang hoa nở)
3. **Quét mã QR** bằng điện thoại
4. **Kết quả:** Phải mở được trang hoa nở!

## 🔧 Cập nhật mã QR (nếu cần)

Nếu deploy xong mà mã QR vẫn sai, làm:

1. Mở file `index.html`
2. Tìm dòng: `const targetUrl = window.location.origin + window.location.pathname.replace('index.html', 'flower-bloom.html');`
3. Thay bằng: `const targetUrl = 'https://your-url.com/flower-bloom.html';`
4. Upload lại file index.html

## 💡 Mẹo nhanh nhất

**Nếu bạn không rành Git, dùng cách này:**

1. Nén thư mục `Demo 8_3` thành file ZIP
2. Vào [app.netlify.com/drop](https://app.netlify.com/drop)
3. Kéo thả file ZIP vào
4. 30 giây là có URL công khai!

## 🎯 URL cuối cùng sẽ như thế nào?

- GitHub Pages: `https://username.github.io/qua-8-3-cho-me/`
- Netlify: `https://beautiful-8-3-gift.netlify.app`
- Vercel: `https://qua-8-3-cho-me.vercel.app`

Mẹ bạn chỉ cần quét mã QR và sẽ thấy ngay hiệu ứng hoa nở đẹp mắt! 🌸

---

**🚨 Quan trọng:** Chọn "Public" repository, nếu là "Private" thì GitHub Pages sẽ không hoạt động miễn phí!
