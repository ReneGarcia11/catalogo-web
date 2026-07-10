import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../data/Client";

const AdminPerfumes = () => {
  // Estados para el formulario (solo img_storage_url)
  const [formData, setFormData] = useState({
    nombre: "",
    marca: "",
    genero: "Mixto",
    gama: "Basicos",
    precio: "",
    stock: "",
    img_storage_url: "",
  });

  // Estados para la UI
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Estados para la subida de imagen
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para errores de imagen
  const [brokenImages, setBrokenImages] = useState({});

  // Opciones para los selects
  const generos = ["Mujer", "Hombre", "Mixto"];
  const gamas = ["Top Picks", "Exclusivos", "Selecta", "Favoritos", "Basicos"];

  // Cargar perfumes existentes
  useEffect(() => {
    fetchPerfumes();
  }, []);

  const fetchPerfumes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("perfumes")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setPerfumes(data || []);
    } catch (err) {
      showMessage("Error al cargar perfumes: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar selección de archivo de imagen
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showMessage("Solo se permiten imágenes JPG, PNG o WebP", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("La imagen no debe superar los 5MB", "error");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Manejar pegado de base64
  const handleBase64Paste = (e) => {
    const value = e.target.value.trim();

    if (value && (value.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(value))) {
      try {
        const base64ToFile = (base64String, filename = 'imagen') => {
          let base64Data = base64String;
          let mimeType = 'image/jpeg';

          if (base64String.includes('base64,')) {
            const matches = base64String.match(/data:([^;]+);base64,/);
            if (matches) mimeType = matches[1];
            base64Data = base64String.split('base64,')[1];
          }

          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const ext = mimeType.split('/')[1];

          return new File([blob], `${filename}.${ext}`, { type: mimeType });
        };

        const file = base64ToFile(value, `perfume-${Date.now()}`);
        if (file) {
          setImageFile(file);
          setImagePreview(value);
        }
      } catch (err) {
        console.warn("Error al procesar base64:", err);
      }
    }
  };

  // Subir imagen a Supabase Storage
  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `perfumes/${fileName}`;

      const { data, error } = await supabase.storage
        .from("Perfumes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("Perfumes")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      showMessage("Error al subir imagen: " + err.message, "error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Eliminar imagen anterior del storage
  const deleteOldImage = async (storageUrl) => {
    if (!storageUrl || !storageUrl.includes('supabase.co/storage/v1/object/public')) {
      return;
    }

    try {
      const urlParts = storageUrl.split("/");
      const bucketIndex = urlParts.findIndex(part => part === "Perfumes");

      if (bucketIndex !== -1) {
        const filePath = urlParts.slice(bucketIndex + 1).join("/");

        const { error } = await supabase.storage
          .from("Perfumes")
          .remove([filePath]);

        if (error) {
          console.warn("No se pudo eliminar imagen anterior:", error.message);
        }
      }
    } catch (err) {
      console.warn("Error al intentar eliminar imagen anterior:", err.message);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: "",
      marca: "",
      genero: "Mixto",
      gama: "Basicos",
      precio: "",
      stock: "",
      img_storage_url: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  // Mostrar mensaje temporal
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Editar perfume
  const handleEdit = (perfume) => {
    setFormData({
      nombre: perfume.nombre || "",
      marca: perfume.marca || "",
      genero: perfume.genero || "Mixto",
      gama: perfume.gama || "Basicos",
      precio: perfume.precio || "",
      stock: perfume.stock || "",
      img_storage_url: perfume.img_storage_url || "",
    });
    setImageFile(null);
    setImagePreview(perfume.img_storage_url || null);
    setEditingId(perfume.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Eliminar perfume
  const handleDelete = async (id) => {
    try {
      const perfumeToDelete = perfumes.find(p => p.id === id);

      const { error } = await supabase
        .from("perfumes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (perfumeToDelete?.img_storage_url) {
        await deleteOldImage(perfumeToDelete.img_storage_url);
      }

      setPerfumes(prev => prev.filter(p => p.id !== id));
      showMessage("Perfume eliminado correctamente", "success");
      setDeleteConfirm(null);
    } catch (err) {
      showMessage("Error al eliminar: " + err.message, "error");
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.nombre.trim()) {
      showMessage("El nombre es obligatorio", "error");
      setSubmitting(false);
      return;
    }
    if (!formData.marca.trim()) {
      showMessage("La marca es obligatoria", "error");
      setSubmitting(false);
      return;
    }
    if (!formData.precio || formData.precio <= 0) {
      showMessage("El precio debe ser mayor a 0", "error");
      setSubmitting(false);
      return;
    }

    let storageUrl = formData.img_storage_url;

    // Si hay un nuevo archivo de imagen, subirlo a storage
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        // Si estamos editando y hay una imagen anterior, eliminarla
        if (editingId && formData.img_storage_url) {
          await deleteOldImage(formData.img_storage_url);
        }
        storageUrl = uploadedUrl;
      } else {
        setSubmitting(false);
        return;
      }
    }

    const perfumeData = {
      nombre: formData.nombre.trim(),
      marca: formData.marca.trim(),
      genero: formData.genero,
      gama: formData.gama,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock) || 0,
      img_storage_url: storageUrl || null,
    };

    try {
      let result;

      if (editingId) {
        result = await supabase
          .from("perfumes")
          .update(perfumeData)
          .eq("id", editingId)
          .select();

        if (result.error) throw result.error;
        setPerfumes(prev =>
          prev.map(p => p.id === editingId ? result.data[0] : p)
        );
        showMessage("Perfume actualizado correctamente", "success");
      } else {
        result = await supabase
          .from("perfumes")
          .insert([perfumeData])
          .select();

        if (result.error) throw result.error;
        setPerfumes(prev => [result.data[0], ...prev]);
        showMessage("Perfume creado correctamente", "success");
      }

      await fetchPerfumes();
      resetForm();
    } catch (err) {
      showMessage("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener la URL de imagen
  const getImageUrl = (perfume) => {
    return perfume.img_storage_url || null;
  };

  // Manejar error de imagen
  const handleImageError = (perfumeId) => {
    setBrokenImages(prev => ({ ...prev, [perfumeId]: true }));
  };

  // Agrupar perfumes por gama
  const perfumesAgrupados = gamas.reduce((acc, gama) => {
    const perfumesDeGama = perfumes.filter(p => p.gama === gama);
    if (perfumesDeGama.length > 0) {
      acc[gama] = perfumesDeGama;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F7F2EC] font-sans">
      {/* Header */}
      <div className="bg-[#18140F] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[#B89A5E] text-lg font-serif italic tracking-tight">
              Panel de Administración
            </h1>
            <span className="text-[#9B8E82] text-[10px] uppercase tracking-[1px] hidden sm:inline">
              | {localStorage.getItem("adminEmail") || "Admin"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem("adminAuth");
                localStorage.removeItem("adminLoginTime");
                localStorage.removeItem("adminEmail");
                window.location.href = "/Panel";
              }}
              className="px-4 py-2 border border-red-500/30 text-red-400 text-xs uppercase tracking-[2px] rounded-sm hover:bg-red-500/10 hover:text-red-300 transition-colors"
              title="Cerrar sesión"
            >
              Salir
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-5 py-2.5 bg-[#B89A5E] text-[#18140F] text-xs uppercase tracking-[2px] font-semibold rounded-sm hover:bg-[#D4B97A] transition-colors"
            >
              {showForm ? "✕ Cancelar" : "+ Nuevo Perfume"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Mensaje */}
        {message && (
          <div className={`mb-6 px-5 py-3 rounded-sm text-xs uppercase tracking-[1px] font-medium ${message.type === "error"
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-green-50 border border-green-200 text-green-700"
            }`}>
            {message.text}
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm p-6 mb-8 shadow-sm">
            <h2 className="font-serif text-xl text-[#18140F] mb-6">
              {editingId ? "Editar Perfume" : "Nuevo Perfume"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nombre */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-1.5 font-medium">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Aventus Creed"
                    className="w-full px-3 py-2.5 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-sm rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors placeholder:text-[#9B8E82]"
                  />
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-1.5 font-medium">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Ej: Creed"
                    className="w-full px-3 py-2.5 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-sm rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors placeholder:text-[#9B8E82]"
                  />
                </div>

                {/* Género */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-1.5 font-medium">
                    Género
                  </label>
                  <div className="flex gap-2">
                    {generos.map((gen) => (
                      <button
                        key={gen}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, genero: gen }))}
                        className={`px-4 py-2 text-[10px] uppercase tracking-[1.5px] rounded-full border transition-all ${formData.genero === gen
                          ? "bg-[#18140F] text-[#B89A5E] border-[#18140F]"
                          : "bg-transparent text-[#6B6055] border-[#E8DECE] hover:border-[#B89A5E]"
                          }`}
                      >
                        {gen === "Mujer" ? "🌸 Mujer" : gen === "Hombre" ? "🔵 Hombre" : "✦ Unisex"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gama */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-1.5 font-medium">
                    Gama
                  </label>
                  <select
                    name="gama"
                    value={formData.gama}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-sm rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors cursor-pointer"
                  >
                    {gamas.map((gama) => (
                      <option key={gama} value={gama}>
                        {gama === "Top Picks" ? "🔥 " : gama === "Exclusivos" ? "✨ " : ""}
                        {gama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-1.5 font-medium">
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6055] text-sm">$</span>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2.5 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-sm rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors placeholder:text-[#9B8E82]"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-1.5 font-medium">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-sm rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors placeholder:text-[#9B8E82]"
                  />
                </div>

                {/* Imagen - SOLO STORAGE */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-1.5 font-medium">
                    Imagen del Perfume
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Subida de archivo */}
                    <div className="flex-1">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#E8DECE] rounded-sm p-6 text-center cursor-pointer hover:border-[#B89A5E] transition-colors bg-[#FAF7F3]"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                        />

                        {imagePreview ? (
                          <div className="space-y-3">
                            <div className="w-32 h-40 mx-auto bg-[#F2EDE5] rounded-sm overflow-hidden">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-[10px] text-[#9B8E82] uppercase tracking-[1px]">
                              {imageFile ? imageFile.name : "Imagen actual"}
                            </p>
                            <p className="text-[10px] text-[#B89A5E] uppercase tracking-[1px] cursor-pointer hover:underline">
                              Cambiar imagen
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <span className="text-3xl block">📷</span>
                            <p className="text-xs text-[#6B6055]">
                              Haz clic para seleccionar una imagen
                            </p>
                            <p className="text-[10px] text-[#9B8E82]">
                              JPG, PNG o WebP • Máx. 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* URL Storage (solo lectura) */}
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase tracking-[1px] text-[#9B8E82] mb-1.5">
                        URL en Storage
                      </label>
                      <input
                        type="url"
                        name="img_storage_url"
                        value={formData.img_storage_url}
                        onChange={handleChange}
                        placeholder="Se genera automáticamente al subir"
                        readOnly
                        className="w-full px-3 py-2.5 border border-[#E8DECE] bg-[#F2EDE5] text-[#6B6055] text-sm rounded-sm focus:outline-none cursor-not-allowed"
                      />
                      <p className="text-[10px] text-[#9B8E82] mt-1.5">
                        La URL se genera automáticamente al subir la imagen
                      </p>
                    </div>
                  </div>

                  {/* Pegar base64 */}
                  <div className="mt-4 pt-4 border-t border-[#E8DECE]">
                    <label className="block text-[10px] uppercase tracking-[1px] text-[#9B8E82] mb-1.5">
                      O pegar imagen en Base64
                    </label>
                    <textarea
                      onChange={handleBase64Paste}
                      rows="3"
                      placeholder="Pega aquí el código base64 de la imagen..."
                      className="w-full px-3 py-2.5 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-xs rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors resize-none font-mono placeholder:text-[#9B8E82]"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-8 py-3 bg-[#18140F] text-[#B89A5E] text-xs uppercase tracking-[2px] font-semibold rounded-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting || uploading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#B89A5E] border-t-transparent rounded-full animate-spin"></span>
                      {uploading ? "Subiendo imagen..." : "Guardando..."}
                    </span>
                  ) : editingId ? "Actualizar Perfume" : "Crear Perfume"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-[#E8DECE] text-[#6B6055] text-xs uppercase tracking-[2px] font-medium rounded-sm hover:border-[#9B8E82] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de perfumes agrupados por gama */}
        <div className="space-y-8">
          {loading ? (
            <div className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm overflow-hidden">
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-2 border-[#B89A5E] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#9B8E82] text-xs uppercase tracking-[2px]">Cargando...</p>
              </div>
            </div>
          ) : perfumes.length === 0 ? (
            <div className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm overflow-hidden">
              <div className="text-center py-20">
                <span className="text-3xl mb-3 block">🕯️</span>
                <p className="font-serif italic text-[#9B8E82]">No hay perfumes registrados</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-[#B89A5E] text-xs uppercase tracking-[2px] underline hover:text-[#D4B97A]"
                >
                  Crear el primer perfume
                </button>
              </div>
            </div>
          ) : (
            Object.entries(perfumesAgrupados).map(([gama, perfumesDeGama]) => (
              <div key={gama} className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8DECE] bg-[#FAF7F3] flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{
                    background:
                      gama === "Top Picks" ? "#D4A017" :
                        gama === "Exclusivos" ? "#AAAAAA" :
                          gama === "Selecta" ? "#5BA3E0" :
                            gama === "Favoritos" ? "#CC6699" :
                              "#6ABF6A"
                  }}></div>
                  <h3 className="font-serif text-base text-[#18140F]">
                    {gama === "Top Picks" ? "🔥 " : gama === "Exclusivos" ? "✨ " : ""}
                    {gama}
                  </h3>
                  <span className="text-[10px] text-[#9B8E82] uppercase tracking-[1px]">
                    ({perfumesDeGama.length} perfumes)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#E8DECE] bg-[#FAF7F3]">
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium w-16">ID</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium">Imagen</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium">Nombre</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium hidden md:table-cell">Marca</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium hidden sm:table-cell">Género</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium">Precio</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium">Stock</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium">Img</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-[2px] text-[#6B6055] font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perfumesDeGama.map((perfume) => (
                        <tr key={perfume.id} className="border-b border-[#E8DECE] hover:bg-[#FAF7F3] transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#9B8E82] font-mono">#{perfume.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-10 h-14 bg-[#F2EDE5] rounded-sm overflow-hidden flex items-center justify-center">
                              {getImageUrl(perfume) && !brokenImages[perfume.id] ? (
                                <img
                                  src={getImageUrl(perfume)}
                                  alt={perfume.nombre}
                                  className="w-full h-full object-cover"
                                  onError={() => handleImageError(perfume.id)}
                                />
                              ) : (
                                <span className="text-lg opacity-30">🕯️</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-serif text-sm text-[#18140F] leading-tight">
                              {perfume.nombre}
                            </p>
                            <p className="text-[10px] text-[#9B8E82] uppercase tracking-[1px] md:hidden">
                              {perfume.marca}
                            </p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-[#6B6055] uppercase tracking-[1px]">
                              {perfume.marca}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={`text-[10px] uppercase tracking-[1px] px-2 py-0.5 rounded-full ${perfume.genero === "Mujer"
                              ? "bg-pink-50 text-pink-600"
                              : perfume.genero === "Hombre"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-green-50 text-green-600"
                              }`}>
                              {perfume.genero}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-serif text-sm text-[#B89A5E]">
                              ${perfume.precio?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${perfume.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                              {perfume.stock > 0 ? perfume.stock : "Agotado"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getImageUrl(perfume) ? (
                              <span className="text-green-600 text-xs">✅</span>
                            ) : (
                              <span className="text-red-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(perfume)}
                                className="px-3 py-1.5 text-[10px] uppercase tracking-[1px] text-[#6B6055] border border-[#E8DECE] rounded-sm hover:border-[#B89A5E] hover:text-[#B89A5E] transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(perfume.id)}
                                className="px-3 py-1.5 text-[10px] uppercase tracking-[1px] text-red-500 border border-red-200 rounded-sm hover:bg-red-50 transition-colors"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          ></div>
          <div className="relative bg-[#FFFDF9] border border-[#E8DECE] rounded-sm p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-serif text-xl text-[#18140F] mb-3">
              ¿Eliminar perfume?
            </h3>
            <p className="text-sm text-[#6B6055] mb-6 leading-relaxed">
              Esta acción no se puede deshacer. El perfume y su imagen en Storage serán eliminados permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 text-xs uppercase tracking-[2px] text-[#6B6055] border border-[#E8DECE] rounded-sm hover:border-[#9B8E82] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2.5 text-xs uppercase tracking-[2px] text-white bg-red-600 rounded-sm hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPerfumes;