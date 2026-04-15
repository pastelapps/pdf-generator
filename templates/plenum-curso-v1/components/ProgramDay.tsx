import React from 'react';

type Topic = { text: string; children: Array<{ text: string; children: any[] }> };
type Props = { tag: string; time: string; title: string; topics: Topic[]; description: string; kind: 'bullets' | 'paragraph'; dayMarginTop?: string };

const s = {
  day: { marginBottom: '5mm', paddingTop: '10mm', breakInside: 'avoid-page' as const },
  header: { display: 'flex', alignItems: 'center', gap: '3mm', marginBottom: '2mm' } as React.CSSProperties,
  tag: {
    display: 'inline-block', background: '#3b82f6', color: '#fff',
    padding: '1.5mm 4mm', borderRadius: '4px', fontSize: '13pt', fontWeight: 700,
  } as React.CSSProperties,
  time: {
    display: 'inline-block', background: '#f1f5f9', color: '#64748b',
    padding: '1.5mm 3.5mm', borderRadius: '20px', fontSize: '11pt',
  } as React.CSSProperties,
  title: {
    fontSize: '18pt', fontWeight: 700, color: '#1a1a2e', marginBottom: '2mm', lineHeight: 1.25,
  } as React.CSSProperties,
  underline: {
    width: '25mm', height: '1mm', background: '#3b82f6', borderRadius: '1mm', marginBottom: '3mm',
  } as React.CSSProperties,
  desc: { fontSize: '13pt', color: '#64748b', lineHeight: 1.5, marginBottom: '3mm' } as React.CSSProperties,
  topicCard: {
    border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6', borderRadius: '4px',
    padding: '2.5mm 4mm', fontSize: '13pt', color: '#334155', lineHeight: 1.45,
    background: '#fafbfc', marginBottom: '2mm',
  } as React.CSSProperties,
};

export function ProgramDay({ tag, time, title, topics, description, kind, dayMarginTop }: Props) {
  return (
    <div style={{ ...s.day, paddingTop: dayMarginTop ?? s.day.paddingTop }}>
      <div style={s.header}>
        <span style={s.tag}>{tag}</span>
        {time && <span style={s.time}>⏱ {time}</span>}
      </div>
      <h3 style={s.title}>{title}</h3>
      <div style={s.underline} />
      {kind === 'paragraph' && description && <p style={s.desc}>{description}</p>}
      {kind === 'bullets' && topics.length > 0 && (
        <div>
          {topics.map((topic, i) => (
            <div key={i} style={s.topicCard}>
              {topic.text}
              {topic.children?.length > 0 && (
                <div style={{ marginTop: '1.5mm', paddingLeft: '4mm' }}>
                  {topic.children.map((c, j) => (
                    <div key={j} style={{ fontSize: '11pt', color: '#64748b', marginTop: '1mm' }}>• {c.text}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
