import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import for ShopGrid
content = content.replace("import { ProductModal } from './components/ProductModal';", "import { ProductModal } from './components/ProductModal';\nimport { ShopGrid } from './components/ShopGrid';")

# 2. Replace Statistics Banner and everything down to Petioles & Peptides with ShopGrid
# We'll use regex to find the Statistics Banner start and Petioles & Peptides start
stat_banner_regex = r"\{\/\* Statistics Banner \*\/.*?\{\/\* Petioles & Peptides Narrative \*\/\}"
shop_grid_code = """{/* Shop Section (CX-First) */}
            <ShopGrid 
              filteredProducts={filteredProducts}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedProduct={setSelectedProduct}
            />

            {/* Petioles & Peptides Narrative */}"""
content = re.sub(stat_banner_regex, shop_grid_code, content, flags=re.DOTALL)

# 3. Remove Signature Showcase Grid and Brand CTA and currentTab === 'shop' block
# Find the start of Signature Showcase Grid and end at the start of Footer or Contact tab.
# Let's just remove the Signature Showcase Grid.
showcase_regex = r"\{\/\* Signature Showcase Grid \*\/.*?\{\/\* Science Highlight Deck \*\/\}"
content = re.sub(showcase_regex, "{/* Science Highlight Deck */}", content, flags=re.DOTALL)

brand_cta_regex = r"\{\/\* Brand CTA \*\/.*?\{\/\* ================= SHOP TAB ================= \*\/\}"
content = re.sub(brand_cta_regex, "{/* ================= SHOP TAB ================= */}", content, flags=re.DOTALL)

shop_tab_regex = r"\{\/\* ================= SHOP TAB ================= \*\/.*?\{\/\* ================= SCIENCE TAB ================= \*\/\}"
content = re.sub(shop_tab_regex, "{/* ================= SCIENCE TAB ================= */}", content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Refactored App.tsx")
