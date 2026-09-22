$filePath = "$PSScriptRoot/../front end/trials-alterations/trials-alterations.html"
$raw = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Replace static dummy gallery items with clean dynamic container containing only upload tile
$oldGallery = '                  <div class="gallery-grid" id="designGalleryGrid">                    <!-- Image 1 -->                    <div class="gallery-item" onclick="openLightbox(0)">                      <img src="../assets/designs/zari-bloom-back.jpg" alt="Blouse Back Design" onerror="this.src=''../assets/designs/blouse-stage.png'';" />                    </div>                    <!-- Image 2 -->                    <div class="gallery-item" onclick="openLightbox(1)">                      <img src="../assets/designs/zari-bloom-front.jpg" alt="Blouse Front Design" onerror="this.src=''../assets/designs/blouse-stage.png'';" />                    </div>                    <!-- Image 3 -->                    <div class="gallery-item" onclick="openLightbox(2)">                      <img src="../assets/pink_silk.jpg" alt="Silk Fabric Swatch" onerror="this.src=''../assets/designs/blouse-stage.png'';" />                    </div>                    <!-- Upload Tile -->                    <div class="gallery-add-tile" onclick="triggerImageUpload()">                      <i data-lucide="plus" style="width:22px;height:22px;"></i>                      <div class="add-tile-title">Add Images</div>                      <div class="add-tile-sub">JPG, PNG (Max 5MB)</div>                      <input type="file" id="imageUploadInput" accept="image/png, image/jpeg, image/webp" style="display:none;" onchange="handleImageUpload(event)" multiple />                    </div>                  </div>'

$newGallery = '                  <div class="gallery-grid" id="designGalleryGrid">                    <!-- Injected dynamically based on selected trial garment -->                    <div class="gallery-add-tile" onclick="triggerImageUpload()">                      <i data-lucide="plus" style="width:22px;height:22px;"></i>                      <div class="add-tile-title">Add Images</div>                      <div class="add-tile-sub">JPG, PNG (Max 5MB)</div>                      <input type="file" id="imageUploadInput" accept="image/png, image/jpeg, image/webp" style="display:none;" onchange="handleImageUpload(event)" multiple />                    </div>                  </div>'

if ($raw.Contains($oldGallery)) {
    $raw = $raw.Replace($oldGallery, $newGallery)
    Write-Host "Gallery dummy items successfully replaced!"
} else {
    Write-Host "Old gallery pattern not found exactly, doing regex replacement"
    $regex = '(?s)<div class="gallery-grid" id="designGalleryGrid">.*?<div class="gallery-add-tile"'
    $replace = '<div class="gallery-grid" id="designGalleryGrid">' + "`r`n" + '                    <!-- Injected dynamically based on selected trial garment -->' + "`r`n" + '                    <div class="gallery-add-tile"'
    $raw = [System.Text.RegularExpressions.Regex]::Replace($raw, $regex, $replace)
    Write-Host "Regex gallery replacement done."
}

# Ensure script version tag has cache buster ?v=6
$raw = $raw.Replace('<script src="trials-alterations.js"></script>', '<script src="trials-alterations.js?v=6"></script>')
$raw = $raw.Replace('<script src="trials-alterations.js?v=5"></script>', '<script src="trials-alterations.js?v=6"></script>')

[System.IO.File]::WriteAllText($filePath, $raw, [System.Text.Encoding]::UTF8)
Write-Host "trials-alterations.html updated successfully!"
