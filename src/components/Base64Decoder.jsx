import React, { useState, useRef } from "react";
import { supabase } from "../data/Client";

const Base64Decoder = () => {
  const [base64Input, setBase64Input] = useState("");
  const [decodedImage, setDecodedImage] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Mostrar mensaje temporal
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Función para convertir base64 a File
  const base64ToFile = (base64String, filename = 'imagen') => {
    try {
      let base64Data = base64String;
      let mimeType = 'image/jpeg';
      
      // Extraer el tipo MIME del prefijo si existe
      if (base64String.includes('base64,')) {
        const matches = base64String.match(/data:([^;]+);base64,/);
        if (matches) {
          mimeType = matches[1];
        }
        base64Data = base64String.split('base64,')[1];
      }
      
      // Decodificar base64
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Determinar extensión
      const extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/bmp': 'bmp'
      };
      const ext = extensions[mimeType] || 'jpg';
      
      return {
        file: new File([blob], `${filename}.${ext}`, { type: mimeType }),
        mimeType,
        extension: ext,
        size: blob.size
      };
    } catch (error) {
      console.error('Error al convertir base64 a File:', error);
      return null;
    }
  };

  // Decodificar imagen
  const handleDecode = () => {
    const input = base64Input.trim();
    
    if (!input) {
      showMessage("Pega un código base64 de imagen", "error");
      return;
    }

    // Verificar si es un base64 válido
    const isValid = input.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(input);
    
    if (!isValid) {
      showMessage("El código no parece ser un base64 de imagen válido", "error");
      return;
    }

    // Crear imagen para preview
    const img = new Image();
    img.onload = () => {
      setDecodedImage(input);
      setImageInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        src: input
      });
      setUploadedUrl(null);
      showMessage("Imagen decodificada correctamente", "success");
    };
    img.onerror = () => {
      showMessage("No se pudo decodificar la imagen. Verifica el código base64.", "error");
      setDecodedImage(null);
      setImageInfo(null);
    };
    img.src = input;
  };

  // Limpiar todo
  const handleClear = () => {
    setBase64Input("");
    setDecodedImage(null);
    setImageInfo(null);
    setUploadedUrl(null);
    setMessage(null);
  };

  // Subir imagen decodificada al bucket de Supabase
  const handleUploadToBucket = async () => {
    if (!decodedImage) {
      showMessage("Primero decodifica una imagen", "error");
      return;
    }

    setUploading(true);
    try {
      const result = base64ToFile(decodedImage, `perfume-${Date.now()}`);
      
      if (!result || !result.file) {
        throw new Error("No se pudo convertir la imagen");
      }

      // Generar nombre único
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${result.extension}`;
      const filePath = `perfumes/${fileName}`;

      // Subir al bucket "Perfumes"
      const { data, error } = await supabase.storage
        .from("Perfumes")
        .upload(filePath, result.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: result.mimeType
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("Perfumes")
        .getPublicUrl(filePath);

      setUploadedUrl(urlData.publicUrl);
      showMessage("Imagen subida correctamente al bucket", "success");
    } catch (err) {
      showMessage("Error al subir: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // Copiar URL al portapapeles
  const handleCopyUrl = async () => {
    if (!uploadedUrl) return;
    
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      showMessage("URL copiada al portapapeles", "success");
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = uploadedUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showMessage("URL copiada al portapapeles", "success");
    }
  };

  // Descargar imagen decodificada
  const handleDownload = () => {
    if (!decodedImage) return;
    
    const link = document.createElement('a');
    link.href = decodedImage;
    link.download = `imagen-decodificada-${Date.now()}.${imageInfo?.extension || 'jpg'}`;
    link.click();
    showMessage("Imagen descargada", "success");
  };

  // Manejar archivo desde el sistema
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      showMessage("Selecciona un archivo de imagen", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBase64Input(event.target.result);
      setDecodedImage(event.target.result);
      setImageInfo({
        width: 0,
        height: 0,
        src: event.target.result
      });
      setUploadedUrl(null);
      showMessage("Imagen cargada correctamente", "success");
    };
    reader.readAsDataURL(file);
  };

  // Formatear tamaño de archivo
  const formatSize = (bytes) => {
    if (!bytes) return 'Desconocido';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-[#F7F2EC] font-sans">
      {/* Header */}
      <div className="bg-[#18140F] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[#B89A5E] text-lg font-serif italic tracking-tight">
              Decodificador Base64
            </h1>
            <span className="text-[#9B8E82] text-xs uppercase tracking-[2px] hidden sm:inline">
              Imágenes
            </span>
          </div>
          <a
            href="/Panel"
            className="px-4 py-2 border border-[#B89A5E] text-[#B89A5E] text-xs uppercase tracking-[2px] rounded-sm hover:bg-[#B89A5E] hover:text-[#18140F] transition-colors"
          >
            ← Panel
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Mensaje */}
        {message && (
          <div className={`mb-6 px-5 py-3 rounded-sm text-xs uppercase tracking-[1px] font-medium ${
            message.type === "error" 
              ? "bg-red-50 border border-red-200 text-red-700" 
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {message.text}
          </div>
        )}

        {/* Área de entrada */}
        <div className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm p-6 mb-6 shadow-sm">
          <h2 className="font-serif text-lg text-[#18140F] mb-4">
            Pegar código Base64
          </h2>

          {/* Textarea para pegar base64 */}
          <textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Pega aquí el código base64 de la imagen (incluyendo data:image/...;base64,...)"
            rows="6"
            className="w-full px-4 py-3 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-xs rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors resize-none font-mono placeholder:text-[#9B8E82]"
          ></textarea>

          {/* Opciones */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={handleDecode}
              className="px-6 py-2.5 bg-[#18140F] text-[#B89A5E] text-xs uppercase tracking-[2px] font-semibold rounded-sm hover:bg-black transition-colors"
            >
              🔍 Decodificar
            </button>
            
            <button
              onClick={handleClear}
              className="px-6 py-2.5 border border-[#E8DECE] text-[#6B6055] text-xs uppercase tracking-[2px] font-medium rounded-sm hover:border-[#9B8E82] transition-colors"
            >
              Limpiar
            </button>

            <div className="h-6 w-px bg-[#E8DECE] hidden sm:block"></div>

            {/* Subir archivo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 border border-[#E8DECE] text-[#6B6055] text-xs uppercase tracking-[2px] font-medium rounded-sm hover:border-[#B89A5E] hover:text-[#B89A5E] transition-colors"
            >
              📁 Cargar archivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Preview de la imagen decodificada */}
        {decodedImage && (
          <div className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm p-6 mb-6 shadow-sm">
            <h2 className="font-serif text-lg text-[#18140F] mb-4">
              Vista previa
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Imagen */}
              <div className="flex-shrink-0">
                <div className="w-64 h-80 bg-[#F2EDE5] rounded-sm overflow-hidden border border-[#E8DECE]">
                  <img
                    src={decodedImage}
                    alt="Imagen decodificada"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-2 font-medium">
                    Información de la imagen
                  </h3>
                  <div className="space-y-2">
                    {imageInfo && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#9B8E82]">Dimensiones:</span>
                          <span className="text-[#18140F] font-medium">
                            {imageInfo.width} × {imageInfo.height} px
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#9B8E82]">Tamaño del base64:</span>
                          <span className="text-[#18140F] font-medium">
                            {formatSize(base64Input.length)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#9B8E82]">Formato:</span>
                          <span className="text-[#18140F] font-medium uppercase">
                            {decodedImage.includes('image/png') ? 'PNG' : 
                             decodedImage.includes('image/webp') ? 'WebP' : 
                             decodedImage.includes('image/gif') ? 'GIF' : 'JPEG'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="space-y-3 pt-4 border-t border-[#E8DECE]">
                  <h3 className="text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-2 font-medium">
                    Acciones
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleUploadToBucket}
                      disabled={uploading}
                      className="px-5 py-2.5 bg-[#B89A5E] text-[#18140F] text-xs uppercase tracking-[2px] font-semibold rounded-sm hover:bg-[#D4B97A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-[#18140F] border-t-transparent rounded-full animate-spin"></span>
                          Subiendo...
                        </span>
                      ) : (
                        "☁️ Subir a Supabase"
                      )}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-5 py-2.5 border border-[#E8DECE] text-[#6B6055] text-xs uppercase tracking-[2px] font-medium rounded-sm hover:border-[#B89A5E] hover:text-[#B89A5E] transition-colors"
                    >
                      💾 Descargar
                    </button>
                  </div>

                  {/* URL subida */}
                  {uploadedUrl && (
                    <div className="mt-4 p-4 bg-[#FAF7F3] border border-[#E8DECE] rounded-sm">
                      <p className="text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-2 font-medium">
                        URL Pública
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={uploadedUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-[#E8DECE] text-[#18140F] text-xs rounded-sm focus:outline-none"
                        />
                        <button
                          onClick={handleCopyUrl}
                          className="px-4 py-2 bg-[#18140F] text-[#B89A5E] text-xs uppercase tracking-[1px] font-medium rounded-sm hover:bg-black transition-colors whitespace-nowrap"
                        >
                          📋 Copiar
                        </button>
                      </div>
                      <p className="text-[10px] text-green-600 mt-2 flex items-center gap-1">
                        ✅ Imagen subida correctamente al bucket "Perfumes"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        {!decodedImage && (
          <div className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm p-6 shadow-sm">
            <h2 className="font-serif text-lg text-[#18140F] mb-4">
              📖 Instrucciones
            </h2>
            <div className="space-y-3 text-sm text-[#6B6055]">
              <div className="flex gap-3">
                <span className="text-[#B89A5E] font-bold">1.</span>
                <p>Pega el código base64 de una imagen en el área de texto. Puede incluir el prefijo <code className="bg-[#FAF7F3] px-1.5 py-0.5 rounded text-xs font-mono">data:image/jpeg;base64,...</code> o solo el código.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#B89A5E] font-bold">2.</span>
                <p>También puedes cargar una imagen desde tu dispositivo usando el botón "Cargar archivo".</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#B89A5E] font-bold">3.</span>
                <p>Haz clic en "Decodificar" para ver la vista previa de la imagen.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#B89A5E] font-bold">4.</span>
                <p>Puedes subir la imagen directamente al bucket "Perfumes" de Supabase o descargarla a tu dispositivo.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64Decoder;