import fs from 'fs';
import path from 'path';

const roles = {
  'super-admin': ['sales', 'products', 'categories', 'customers', 'expenses', 'team', 'activity-logs'],
  'admin': ['sales', 'products', 'categories', 'customers', 'expenses'],
  'staff': ['sales', 'products', 'customers']
};

const baseDir = path.join(process.cwd(), 'src/app/(dashboard)/dashboard');

Object.entries(roles).forEach(([role, pages]) => {
  // Create role base overview
  const roleDir = path.join(baseDir, role);
  if (!fs.existsSync(roleDir)) fs.mkdirSync(roleDir, { recursive: true });
  
  fs.writeFileSync(path.join(roleDir, 'page.tsx'), `export default function ${role.replace('-', '')}Overview() {
  return <div className="p-6"><h1 className="text-2xl font-bold capitalize">${role.replace('-', ' ')} Overview</h1></div>;
}`);

  // Create pages
  pages.forEach(page => {
    const pageDir = path.join(roleDir, page);
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
    
    fs.writeFileSync(path.join(pageDir, 'page.tsx'), `export default function ${page.replace('-', '')}Page() {
  return <div className="p-6"><h1 className="text-2xl font-bold capitalize">${page.replace('-', ' ')}</h1></div>;
}`);
  });
});

console.log('Pages scaffolded successfully!');
