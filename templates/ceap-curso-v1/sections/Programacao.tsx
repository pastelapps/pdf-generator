import React from 'react';
import type { CeapViewModel } from '../../../src/schemas/ceap-view-model.js';
import { ProgramHeader } from '../components/ProgramHeader.js';
import { ProgramFooter } from '../components/ProgramFooter.js';

type Props = { data: CeapViewModel };

function addMm(base: number, delta: string | undefined): string {
  if (!delta) return `${base}mm`;
  return `${base + parseFloat(delta)}mm`;
}

export function Programacao({ data }: Props) {
  const ov = data.sectionOverrides?.programacao;
  const dateMarginTop = addMm(6, ov?.date_margin_top);
  const bulletPadding = addMm(2, ov?.bullet_padding);
  const fontScale = parseFloat(ov?.font_size || '0');

  const dateFontSize = `${13 + fontScale}pt`;
  const titleFontSize = `${12 + fontScale}pt`;
  const bulletFontSize = `${11 + fontScale}pt`;
  const subBulletFontSize = `${10 + fontScale}pt`;
  const descFontSize = `${11 + fontScale}pt`;

  const page: React.CSSProperties = {
    width: '210mm',
    height: '297mm',
    backgroundImage: `url(${data.assets.backgroundProgramacao})`,
    backgroundSize: '210mm 297mm',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    color: '#1a1a2e',
    overflow: 'hidden',
  };

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    padding: '6mm 20mm 0 20mm',
    overflow: 'hidden',
  };

  // Split program days into pages (~3 items per page depending on content)
  const days = data.course.programDays;

  // Simple split: first page gets fewer items (has header overhead), rest get more
  const ITEMS_FIRST_PAGE = 3;
  const ITEMS_PER_PAGE = 4;
  const pages: Array<typeof days> = [];

  if (days.length <= ITEMS_FIRST_PAGE) {
    pages.push(days);
  } else {
    pages.push(days.slice(0, ITEMS_FIRST_PAGE));
    for (let i = ITEMS_FIRST_PAGE; i < days.length; i += ITEMS_PER_PAGE) {
      pages.push(days.slice(i, i + ITEMS_PER_PAGE));
    }
  }

  return (
    <>
      {pages.map((pageDays, pageIdx) => (
        <div key={pageIdx} style={page} className="page-break">
          <ProgramHeader
            title={data.course.title}
            subtitle={data.course.subtitle}
            dateLabel={data.course.dateLabel}
            locationCity={data.course.locationCity}
            showLabel={false}
          />

          <div style={bodyStyle}>
            {pageDays.map((day, dayIdx) => (
              <div key={dayIdx} style={{ marginBottom: '4mm' }}>
                {/* Day tag (e.g., "14/04 (Terça-Feira): 14h às 17h") */}
                <div style={{
                  fontSize: dateFontSize,
                  fontWeight: 700,
                  color: '#1a1a2e',
                  marginTop: dayIdx === 0 ? '4mm' : dateMarginTop,
                  marginBottom: '3mm',
                }}>
                  {day.tag}{day.time ? `: ${day.time}` : ''}
                </div>

                {/* Day title (e.g., "Módulo 1 – Fundamentos...") */}
                {day.title && day.title !== day.tag && (
                  <div style={{
                    fontSize: titleFontSize,
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '3mm',
                    lineHeight: 1.35,
                  }}>
                    {day.title}
                  </div>
                )}

                {/* Description paragraph if no bullets */}
                {day.kind === 'paragraph' && day.description && (
                  <p style={{
                    fontSize: descFontSize,
                    color: '#334155',
                    lineHeight: 1.5,
                    marginBottom: '3mm',
                  }}>
                    {day.description}
                  </p>
                )}

                {/* Bullet topics */}
                {day.kind === 'bullets' && day.topics.length > 0 && (
                  <div style={{ paddingLeft: '5mm' }}>
                    {day.topics.map((topic, tIdx) => (
                      <div key={tIdx}>
                        <div style={{
                          fontSize: bulletFontSize,
                          color: '#1a1a2e',
                          marginBottom: bulletPadding,
                          lineHeight: 1.45,
                        }}>
                          &bull; {topic.text}
                        </div>
                        {topic.children?.length > 0 && (
                          <div style={{ paddingLeft: '8mm' }}>
                            {topic.children.map((child: any, cIdx: number) => (
                              <div key={cIdx} style={{
                                fontSize: subBulletFontSize,
                                color: '#334155',
                                marginBottom: bulletPadding,
                                lineHeight: 1.45,
                              }}>
                                &#9675; {child.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <ProgramFooter
            contato={data.contato}
            logoBranco={data.assets.logoCeapBranco}
          />
        </div>
      ))}
    </>
  );
}
