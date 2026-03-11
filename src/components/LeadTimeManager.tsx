import { MaterialLeadTime } from '../types';

export const LeadTimeManager = ({ 
  leadTimes, 
  updateLeadTime 
}: { 
  leadTimes: MaterialLeadTime[], 
  updateLeadTime: (lt: MaterialLeadTime) => void 
}) => {
  const grouped = leadTimes.reduce((acc, lt) => {
    if (!acc[lt.category]) acc[lt.category] = [];
    acc[lt.category].push(lt);
    return acc;
  }, {} as Record<string, MaterialLeadTime[]>);

  return (
    <div className="p-10 bg-white rounded-3xl border border-[#003366]/10 shadow-lg">
      <h2 className="text-3xl font-serif italic mb-8 text-[#003366]">Tiempos Límite de Pedido (Días)</h2>
      <div className="border border-[#003366]/20 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr,auto] p-4 border-b border-[#003366]/20 font-bold uppercase text-xs tracking-widest bg-[#003366]/5 text-[#003366]">
          <div>Ítem</div>
          <div className="text-right">Días</div>
        </div>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="p-4 bg-[#003366]/10 border-b border-[#003366]/20 font-bold font-serif italic text-lg text-[#003366]">
              {category}
            </div>
            {items.map((lt) => (
              <div key={lt.id} className="grid grid-cols-[1fr,auto] p-4 border-b border-[#003366]/10 font-mono text-sm items-center hover:bg-[#003366]/5 transition-colors">
                <div className="pl-6 text-[#003366]/80">{lt.subCategory || lt.category}</div>
                <div className="text-right">
                  <input
                    type="number"
                    value={lt.leadTimeDays}
                    onChange={(e) => updateLeadTime({ ...lt, leadTimeDays: parseInt(e.target.value) || 0 })}
                    className="w-16 border border-[#003366]/20 rounded-lg p-2 text-right font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
