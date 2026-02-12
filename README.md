# Shadowdark Character Sheet

A mobile-optimized digital character sheet for the Shadowdark RPG system. Import a Shadowdarklings character and manage inventory, spells, and interact with shops all in one streamlined interface.

## Technologies

- **React 18.3** - UI framework
- **TypeScript** - Type-safe development
- **Vite 6.3** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Vaul** - Drawer component for mobile

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/shadowdark-sheet.git
cd shadowdark-sheet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

This project is configured for GitHub Pages deployment. On every push to the `main` branch, the site automatically builds and deploys via GitHub Actions.

The live site will be available at: `https://[your-username].github.io/shadowdark-sheet/`

## Usage Tips

### Quick Actions
- **Click to Edit**: Most fields can be edited by clicking directly on them
- **Right-Click Menus**: Access additional options on weapons, spells, inventory items, and shop items
- **Swipe Navigation**: Swipe left/right to switch between character panels
- **Long Press**: On mobile, long-press items to access context menus

### Import/Export Workflow
1. Use the **Upload** button to import a character JSON file
2. Use the **Download** button to export your current character
3. Shop data is included in character exports but can also be exported separately

### Shop Management
1. Open the shop from the inventory view
2. Switch between **Buy** and **Sell** modes
3. Adjust markup percentages to customize pricing
4. Use the **+** button to add custom items to the shop
5. Right-click items to edit or remove them

### Dice Rolling
1. Click the **dice icon** button to open the roller
2. Add dice to your pool by clicking dice types
3. Select advantage/disadvantage mode if needed
4. Add any modifiers in the bonus field
5. Hit **Roll** to see results

## License

This project is provided as-is for personal use. Shadowdark RPG is a trademark of The Arcane Library.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- Shadowdark RPG by Kelsey Dionne
- Built with love for the TTRPG community
