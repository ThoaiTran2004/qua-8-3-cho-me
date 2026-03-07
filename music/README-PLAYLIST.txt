🎵 HƯỚNG DẪN SỬ DỤNG MUSIC PLAYER

🎹 CÁCH THÊM NHẠC CỦA BẠN:

1. **Thêm file nhạc vào thư mục music/:**
   - Tải file nhạc MP3 hoặc OGG
   - Đặt vào thư mục: d:\Demo 8_3\music\
   - Đặt tên theo danh sách dưới đây

2. **Danh sách nhạc mặc định:**
   🎹 Nhạc Piano Lãng Mạn
      → music/piano-romantic.mp3
      → music/piano-romantic.ogg (backup)
   
   🎸 Nhạc Guitar Acoustic  
      → music/guitar-acoustic.mp3
      → music/guitar-acoustic.ogg (backup)
   
   🎺 Nhạc Cổ Điển
      → music/classical-music.mp3
      → music/classical-music.ogg (backup)
   
   🎻 Nhạc Violin Nhẹ Nhàng
      → music/violin-soft.mp3
      → music/violin-soft.ogg (backup)
   
   🎤 Nhạc Pop Yêu Thích
      → music/pop-favorite.mp3
      → music/pop-favorite.ogg (backup)
   
   🎶 Nhạc Không Lời
      → music/instrumental.mp3
      → music/instrumental.ogg (backup)

3. **Cách thay đổi playlist:**
   - Mở file js/script.js
   - Tìm phần "Playlist songs" (dòng ~22)
   - Thay đổi tên và đường dẫn file nhạc:
   ```javascript
   const playlist = [
       {
           name: '🎹 Tên bài hát của bạn',
           file: 'music/ten-bai-hat.mp3',
           backup: 'music/ten-bai-hat.ogg'
       },
       // Thêm các bài hát khác...
   ];
   ```

4. **Điều khiển music player:**
   - 🎵/⏸️: Play/Pause
   - ⏮️: Bài trước
   - ⏭️: Bài tiếp theo  
   - 📋: Mở/Đóng danh sách nhạc
   - 🔊: Điều chỉnh volume

5. **Tính năng:**
   - ✅ Playlist với 6 bài hát
   - ✅ Chọn bài trực tiếp từ danh sách
   - ✅ Auto-play bài tiếp theo khi hết
   - ✅ Volume control (0-100%)
   - ✅ Backup file khi lỗi
   - ✅ Loop playlist
   - ✅ Visual feedback khi đang play

6. **Gợi ý nhạc phù hợp:**
   - Nhạc không lời, nhẹ nhàng
   - Piano, guitar acoustic
   - Classical, instrumental
   - Romantic ballad
   - Thời lượng: 3-5 phút mỗi bài

7. **Lưu ý:**
   - File MP3 nên < 5MB để tải nhanh
   - Có thể thêm cả file OGG làm backup
   - Nếu không có file nào, sẽ hiển thị lỗi
   - Nhạc sẽ tự động loop khi hết playlist

🎹 Thêm nhạc của bạn và tận hưởng trang web với âm nhạc yêu thích!
