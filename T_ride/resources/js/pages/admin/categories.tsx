import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Plus, Edit, Trash2, Tag, Layers, ToggleLeft, ToggleRight, Edit2 } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { CategoryModal } from "@/components/admin/CategoryModal"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import axios from "@/lib/axios"

interface Category {
    id: number
    name: string
    slug: string
    icon: string
    status: boolean | number
    created_at?: string
    updated_at?: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/admin/categories")
            if (response.data.status) {
                setCategories(response.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSaveCategory = async (data: any) => {
        try {
            if (editingCategory) {
                // Update
                await axios.put(`/admin/categories/${editingCategory.id}`, data)
            } else {
                // Create
                await axios.post("/admin/categories", data)
            }
            fetchCategories()
            setIsModalOpen(false)
            setEditingCategory(null)
        } catch (error) {
            console.error("Failed to save category:", error)
            throw error 
        }
    }

    const confirmDelete = (category: Category) => {
        setCategoryToDelete(category)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return
        
        try {
            setIsDeleting(true)
            await axios.delete(`/admin/categories/${categoryToDelete.id}`)
            fetchCategories()
            setIsDeleteModalOpen(false)
            setCategoryToDelete(null)
        } catch (error) {
            console.error("Failed to delete category:", error)
            alert("Failed to delete category. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleStatus = async (category: Category) => {
        try {
            await axios.patch(`/admin/categories/${category.id}/status`)
            fetchCategories()
        } catch (error) {
            console.error("Failed to toggle status:", error)
        }
    }

    const openCreateModal = () => {
        setEditingCategory(null)
        setIsModalOpen(true)
    }

    const openEditModal = (category: Category) => {
        setEditingCategory(category)
        setIsModalOpen(true)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
    }

    return (
        <AdminLayout
            title="Categories"
            description="Manage product categories"
            actions={
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search categories..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-64"
                        />
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus size={18} />
                        Add Category
                    </Button>
                </div>
            }
        >
             {/* Main Content Area */}
             {loading ? (
                <div className="text-white/50 text-center py-12">Loading categories...</div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                         <div key={category.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-tride-yellow/30 transition-all duration-300 group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-blue-500 bg-opacity-20 flex items-center justify-center text-white ring-1 ring-white/10`}>
                                     {category.icon ? (
                                        (category.icon.startsWith('http') || category.icon.includes('/')) ?
                                        <img src={category.icon} alt={category.name} className="w-8 h-8 object-contain" />
                                        : <i className={`${category.icon} text-xl`}></i>
                                    ) : (
                                        <TagsIcon />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <IconButton tooltip="Edit Category" onClick={() => openEditModal(category)}>
                                        <Edit2 size={16} />
                                    </IconButton>
                                    <IconButton variant="danger" tooltip="Delete Category" onClick={() => confirmDelete(category)}>
                                        <Trash2 size={16} />
                                    </IconButton>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                            <p className="text-white/50 text-sm mb-6">{category.slug}</p>

                            <div className="flex items-center justify-between">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleStatus(category);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                        category.status 
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                                    }`}
                                >
                                    {category.status ? 'Active' : 'Inactive'}
                                </button>
                                <span className="text-xs text-white/30">
                                    {formatDate(category.created_at)}
                                </span>
                            </div>
                         </div>
                    ))}

                    {/* Add New Card Placeholder */}
                    <button 
                        onClick={openCreateModal}
                        className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-white/30 hover:text-tride-yellow hover:border-tride-yellow/50 hover:bg-tride-yellow/5 transition-all duration-300 min-h-[200px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-tride-yellow/20">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold text-lg">Create New Category</span>
                    </button>
                </div>
             )}

            <CategoryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCategory}
                initialData={editingCategory}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                description="Are you sure you want to permanently delete this category?"
                itemName={categoryToDelete?.name}
                isLoading={isDeleting}
            />
        </AdminLayout>
    )
}

function TagsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"/>
            <path d="M6 9.01V9"/>
            <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/>
        </svg>
    )
}
