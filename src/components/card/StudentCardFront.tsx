import React from 'react';
import { Student } from '../../types/student';
import { CardTemplate } from '../../types/template';
import { toKhmerNumerals, toArabicNumerals } from '../../utils/khmerNumerals';
import {
  MOEYS_EMBLEM_DATA_URI,
  resolveFlourishUrl,
  DEFAULT_FLOURISH_DATA_URI,
} from '../../utils/assets';

interface StudentCardFrontProps {
  student?: Partial<Student>;
  template: CardTemplate;
  scale?: number;
  className?: string;
  showCuttingBorder?: boolean;
}

export const StudentCardFront: React.FC<StudentCardFrontProps> = ({
  student,
  template,
  scale = 1,
  className = '',
  showCuttingBorder = true,
}) => {
  const cardWidthMm = template.cardWidthMm || 64;
  const cardHeightMm = template.cardHeightMm || 92;
  const isLandscape = cardWidthMm > cardHeightMm;

  // Base dimensions: 5px per mm (e.g. 64x92 mm => 320x460 px, 86x54 mm => 430x270 px)
  const baseWidth = Math.round(cardWidthMm * 5);
  const baseHeight = Math.round(cardHeightMm * 5);

  // Scalability ratio based on canonical standard references:
  // Portrait reference: 64mm x 92mm => 320px x 460px
  // Landscape reference: 86mm x 54mm => 430px x 270px
  const s = isLandscape ? baseWidth / 430 : baseWidth / 320;

  const blueColor = template.primaryColor || '#163d7e';
  const isBottomPhoto = template.variant === 'bottom-photo';

  // Format display school name (e.g. if 'អនុវិទ្យាល័យដំណាក់ព្រីង' or 'ដំណាក់ព្រីង')
  const displaySchoolName = template.schoolNameOnly
    ? template.schoolNameOnly.replace(/^អនុ[\/\s]*វិទ្យាល័យ\s*/, '')
    : '';

  // Safe Emblem & Flourish Sources (Embedded Data URIs ensure logo and flourish NEVER disappear)
  const emblemSource =
    template.emblemUrl &&
    !template.emblemUrl.includes('moeys_emblem.svg') &&
    (template.emblemUrl.startsWith('data:') || template.emblemUrl.startsWith('http'))
      ? template.emblemUrl
      : MOEYS_EMBLEM_DATA_URI;
  const flourishSource = resolveFlourishUrl(template.flourishUrl);

  // Format student details: Class and Date of Birth must be written in Arabic numerals
  const nameKm = student?.nameKm || '';
  const gender = student?.gender || '';
  const nationality = student?.nationality || (student?.nameKm ? 'ខ្មែរ' : '');
  const studentClass = student?.class ? toArabicNumerals(student.class) : '';
  const studentId = student?.studentId || '';
  const cardNumber = student?.cardNumber
    ? toKhmerNumerals(student.cardNumber)
    : studentId
    ? toKhmerNumerals(studentId)
    : '';
  const dob = student?.dateOfBirth ? toArabicNumerals(student.dateOfBirth) : '';
  const pob = student?.placeOfBirth || '';
  const fatherName = student?.fatherName || '';
  const fatherJob = student?.fatherOccupation || '';
  const motherName = student?.motherName || '';
  const motherJob = student?.motherOccupation || '';
  const address = student?.address || '';
  const academicYear = student?.academicYear
    ? toKhmerNumerals(student.academicYear)
    : '';

  // Helper for empty dotted line
  const renderDottedLine = () => (
    <div
      className="flex-1 border-b border-dotted min-w-[20px] self-end mb-[2px]"
      style={{
        borderColor: `${blueColor}55`,
        borderWidth: `${Math.max(1, 1 * s)}px`,
      }}
    />
  );

  return (
    <div
      style={{
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
      }}
      className={`relative shrink-0 select-none overflow-hidden ${className}`}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          padding: `${Math.round(6 * s)}px`,
        }}
        className={`relative bg-white font-battambang box-border ${
          showCuttingBorder ? 'border border-dashed border-slate-300' : ''
        }`}
      >
        {/* Outer Solid Blue Border */}
        <div
          style={{
            borderColor: blueColor,
            borderWidth: `${Math.max(1, 1.2 * s)}px`,
            padding: `${Math.round(5 * s)}px`,
          }}
          className="relative w-full h-full border border-solid flex flex-col overflow-hidden"
        >
          {/* Centered Watermark Logo (MoEYS emblem) */}
          {template.showWatermark && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{
                opacity: template.watermarkOpacity || 0.16,
                transform: isBottomPhoto ? 'translateY(0px)' : `translateY(${Math.round(20 * s)}px)`,
              }}
            >
              <img
                src={emblemSource}
                alt="MoEYS Watermark"
                style={{
                  width: `${Math.round(170 * s)}px`,
                  height: `${Math.round(170 * s)}px`,
                }}
                className="object-contain"
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. LANDSCAPE LAYOUT (e.g. 86mm x 54mm CR80 Landscape)    */}
          {/* ======================================================== */}
          {isLandscape && (
            <div
              className="relative z-10 flex h-full justify-between"
              style={{ gap: `${Math.round(10 * s)}px`, padding: `${Math.round(3 * s)}px` }}
            >
              {/* Left Column: 3x4 Photo Box + ID */}
              <div
                className="flex flex-col items-center justify-between shrink-0"
                style={{ width: `${Math.round(108 * s)}px` }}
              >
                <div
                  style={{
                    borderColor: blueColor,
                    borderWidth: `${Math.max(1, 1.2 * s)}px`,
                    width: `${Math.round(108 * s)}px`,
                    height: `${Math.round(144 * s)}px`, // Strictly 3:4 ratio
                  }}
                  className="border border-solid bg-slate-50/20 flex items-center justify-center relative overflow-hidden"
                >
                  {student?.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt="Student Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      style={{ color: blueColor, fontSize: `${Math.round(13 * s)}px` }}
                      className="font-bold font-sans tracking-wider opacity-70"
                    >
                      {template.photoBoxText || '3 x 4'}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(9.5 * s)}px`,
                    marginTop: `${Math.round(4 * s)}px`,
                  }}
                  className="font-battambang font-bold text-center truncate w-full"
                >
                  {studentId ? `អត្តលេខៈ ${studentId}` : 'អត្តលេខៈ ..........'}
                </div>
              </div>

              {/* Right Column: Headers, Title, Student Details, Signatures */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Top Headers */}
                <div className="text-center">
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(10 * s)}px`,
                      lineHeight: `${Math.round(14 * s)}px`,
                    }}
                    className="font-moul tracking-wide"
                  >
                    {template.countryHeaderKm1}
                  </div>
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(9 * s)}px`,
                      lineHeight: `${Math.round(13 * s)}px`,
                    }}
                    className="font-moul tracking-wide"
                  >
                    {template.countryHeaderKm2}
                  </div>

                  {/* Ministry & School */}
                  <div className="flex items-center gap-1.5 mt-0.5 text-left">
                    <img
                      src={emblemSource}
                      alt="MoEYS Emblem"
                      style={{
                        width: `${Math.round(16 * s)}px`,
                        height: `${Math.round(20 * s)}px`,
                      }}
                      className="object-contain shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        style={{
                          color: blueColor,
                          fontSize: `${Math.round(9 * s)}px`,
                          lineHeight: `${Math.round(12 * s)}px`,
                        }}
                        className="font-battambang font-bold truncate"
                      >
                        {template.ministryDepartment}
                      </div>
                      <div
                        style={{
                          color: blueColor,
                          fontSize: `${Math.round(8 * s)}px`,
                          lineHeight: `${Math.round(11 * s)}px`,
                        }}
                        className="font-battambang truncate"
                      >
                        <span className="font-semibold">អនុ/វិទ្យាល័យ </span>
                        <span className="font-bold">{displaySchoolName || '................'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(10 * s)}px`,
                      lineHeight: `${Math.round(14 * s)}px`,
                      marginTop: `${Math.round(2 * s)}px`,
                    }}
                    className="font-moul"
                  >
                    {template.cardTitleKm}
                  </div>
                </div>

                {/* Details */}
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(8.5 * s)}px`,
                    lineHeight: `${Math.round(13 * s)}px`,
                    gap: `${Math.round(3 * s)}px`,
                  }}
                  className="flex flex-col font-battambang my-1"
                >
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">គោត្តនាម-នាមៈ</span>
                    {nameKm ? (
                      <span
                        className="font-bold pl-1 truncate"
                        style={{ fontSize: `${Math.round(10 * s)}px` }}
                      >
                        {nameKm}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span>ភេទ </span>
                      <span className="font-bold">{gender || '...'}</span>
                    </div>
                    <div>
                      <span>សញ្ជាតិ </span>
                      <span className="font-bold">{nationality || 'ខ្មែរ'}</span>
                    </div>
                    <div>
                      <span>ថ្នាក់ទី </span>
                      <span className="font-bold font-sans">{studentClass || '...'}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">ថ្ងៃខែកំណើតៈ</span>
                    {dob ? (
                      <span
                        className="font-bold font-sans pl-1 truncate"
                        style={{ fontSize: `${Math.round(9 * s)}px` }}
                      >
                        {dob}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">ទីលំនៅៈ</span>
                    {address ? (
                      <span className="font-semibold pl-1 truncate">{address}</span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                </div>

                {/* Signatures */}
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(7.5 * s)}px`,
                    paddingTop: `${Math.round(3 * s)}px`,
                    borderColor: `${blueColor}25`,
                  }}
                  className="flex items-end justify-between border-t mt-auto"
                >
                  <div className="text-left">
                    <div>{template.issueDateLine || 'ថ្ងៃទី...ខែ...ឆ្នាំ២០...'}</div>
                    <div
                      className="font-bold"
                      style={{ fontSize: `${Math.round(8.5 * s)}px` }}
                    >
                      {template.directorTitle || 'នាយក'}: {template.directorName || 'ជា សារ៉ា'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div>{template.signatureTitle || 'ហត្ថលេខាសាមីខ្លួន'}</div>
                    <div
                      className="font-bold truncate max-w-[90px]"
                      style={{ fontSize: `${Math.round(8.5 * s)}px` }}
                    >
                      {nameKm || '...............'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. VARIANT 1: TOP-PHOTO (Exact MoEYS Official Clone)      */}
          {/* ======================================================== */}
          {!isLandscape && !isBottomPhoto && (
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* 1. Header (Centered) */}
              <div className="text-center pt-[1px]">
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(12 * s)}px`,
                    lineHeight: `${Math.round(17 * s)}px`,
                  }}
                  className="font-moul tracking-wide"
                >
                  {template.countryHeaderKm1}
                </div>
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(11 * s)}px`,
                    lineHeight: `${Math.round(16 * s)}px`,
                    marginTop: `${Math.round(1 * s)}px`,
                  }}
                  className="font-moul tracking-wide"
                >
                  {template.countryHeaderKm2}
                </div>

                {/* Flourish: ផ្នែកខាងក្រោមព្រះរាជា */}
                <div
                  className="flex items-center justify-center my-[1px]"
                  style={{ height: `${Math.round(10 * s)}px` }}
                >
                  <img
                    src={flourishSource}
                    alt=""
                    style={{
                      width: `${Math.round(125 * s)}px`,
                      height: `${Math.round(10 * s)}px`,
                    }}
                    className="object-contain opacity-95"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_FLOURISH_DATA_URI;
                    }}
                  />
                </div>

                {/* Ministry & School (Logo centered & level with the two lines) */}
                <div className="flex items-center gap-1 mt-[1px] text-left">
                  <img
                    src={emblemSource}
                    alt="MoEYS Emblem"
                    style={{
                      width: `${Math.round(18 * s)}px`,
                      height: `${Math.round(23 * s)}px`,
                    }}
                    className="object-contain shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        color: blueColor,
                        fontSize: `${Math.round(9.5 * s)}px`,
                        lineHeight: `${Math.round(13 * s)}px`,
                      }}
                      className="font-battambang font-bold tracking-tight truncate"
                    >
                      {template.ministryDepartment}
                    </div>
                    <div
                      style={{
                        color: blueColor,
                        fontSize: `${Math.round(9 * s)}px`,
                        lineHeight: `${Math.round(13 * s)}px`,
                      }}
                      className="font-battambang tracking-tight flex items-baseline gap-1 mt-[1px]"
                    >
                      <span className="shrink-0 font-semibold">អនុ/វិទ្យាល័យ</span>
                      {displaySchoolName ? (
                        <span
                          className="font-bold truncate"
                          style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                        >
                          {displaySchoolName}
                        </span>
                      ) : (
                        renderDottedLine()
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Photo Box on Left & Title/Fields on Right */}
              <div
                className="flex items-stretch gap-2"
                style={{ marginTop: `${Math.round(4 * s)}px` }}
              >
                {/* 3x4 Photo Box on Left: Strictly 3:4 ratio */}
                <div
                  style={{
                    borderColor: blueColor,
                    borderWidth: `${Math.max(1, 1.2 * s)}px`,
                    width: `${Math.round(76 * s)}px`,
                    height: `${Math.round(101 * s)}px`, // 76:101 ≈ 3:4
                  }}
                  className="border border-solid bg-slate-50/20 shrink-0 flex items-center justify-center relative overflow-hidden"
                >
                  {student?.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt="Student Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      style={{ color: blueColor, fontSize: `${Math.round(12 * s)}px` }}
                      className="font-bold font-sans tracking-wider opacity-70"
                    >
                      {template.photoBoxText || '3 x 4'}
                    </div>
                  )}
                </div>

                {/* Right of Photo Box: Title + 3 rows */}
                <div className="flex-1 flex flex-col justify-between py-[1px] min-w-0">
                  <div className="text-center">
                    <div
                      style={{
                        color: blueColor,
                        fontSize: `${Math.round(11.5 * s)}px`,
                        lineHeight: `${Math.round(17 * s)}px`,
                      }}
                      className="font-moul tracking-normal"
                    >
                      {template.cardTitleKm}
                    </div>
                    <div
                      style={{
                        color: blueColor,
                        fontSize: `${Math.round(9.5 * s)}px`,
                        marginTop: `${Math.round(1 * s)}px`,
                      }}
                      className="leading-tight flex items-center justify-center gap-1"
                    >
                      <span className="font-medium">{template.cardNumberPrefix}</span>
                      {cardNumber ? (
                        <span
                          className="font-bold"
                          style={{ fontSize: `${Math.round(10.5 * s)}px` }}
                        >
                          {cardNumber}
                        </span>
                      ) : (
                        <span className="font-normal opacity-70">........................</span>
                      )}
                    </div>
                    <div
                      style={{
                        color: blueColor,
                        fontSize: `${Math.round(9 * s)}px`,
                        marginTop: `${Math.round(1 * s)}px`,
                      }}
                      className="leading-tight text-center"
                    >
                      {academicYear ? (
                        <span>
                          ឆ្នាំសិក្សា <span className="font-bold">{academicYear}</span>
                        </span>
                      ) : (
                        <span>{template.academicYearPrefix}</span>
                      )}
                    </div>
                  </div>

                  {/* 3 rows beside photo */}
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(9.5 * s)}px`,
                      lineHeight: `${Math.round(15 * s)}px`,
                      gap: `${Math.round(3.5 * s)}px`,
                    }}
                    className="flex flex-col"
                  >
                    <div className="flex items-baseline">
                      <span className="shrink-0 font-medium">គោត្តនាម-នាមៈ</span>
                      {nameKm ? (
                        <span
                          className="font-bold tracking-wide pl-1 truncate"
                          style={{ fontSize: `${Math.round(11 * s)}px` }}
                        >
                          {nameKm}
                        </span>
                      ) : (
                        renderDottedLine()
                      )}
                    </div>
                    {/* Row 2: ភេទ & សញ្ជាតិ */}
                    <div className="flex items-baseline">
                      <div
                        className="flex items-baseline shrink-0"
                        style={{ width: `${Math.round(56 * s)}px` }}
                      >
                        <span className="shrink-0 font-medium">ភេទ</span>
                        <span
                          className="pl-1 truncate font-bold"
                          style={{ fontSize: `${Math.round(10 * s)}px` }}
                        >
                          {gender || '...'}
                        </span>
                      </div>
                      <div className="flex items-baseline flex-1 min-w-0">
                        <span className="shrink-0 font-medium">សញ្ជាតិ</span>
                        <span
                          className="pl-1 truncate font-bold"
                          style={{ fontSize: `${Math.round(10 * s)}px` }}
                        >
                          {nationality || 'ខ្មែរ'}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: ថ្នាក់ទី & អត្តលេខ */}
                    <div className="flex items-baseline">
                      <div
                        className="flex items-baseline shrink-0"
                        style={{ width: `${Math.round(56 * s)}px` }}
                      >
                        <span className="shrink-0 font-medium">ថ្នាក់ទី</span>
                        <span
                          className="pl-1 truncate font-bold font-sans"
                          style={{ fontSize: `${Math.round(10.5 * s)}px` }}
                        >
                          {studentClass || '...'}
                        </span>
                      </div>
                      <div className="flex items-baseline flex-1 min-w-0">
                        <span className="shrink-0 font-medium">អត្តលេខៈ</span>
                        <span
                          className="pl-1 truncate font-bold font-sans"
                          style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                        >
                          {studentId || '...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 5 Full Width Lines below Photo Box */}
              <div
                style={{
                  color: blueColor,
                  fontSize: `${Math.round(9 * s)}px`,
                  lineHeight: `${Math.round(14 * s)}px`,
                  gap: `${Math.round(3.5 * s)}px`,
                  marginTop: `${Math.round(3 * s)}px`,
                }}
                className="flex flex-col"
              >
                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium">ថ្ងៃខែឆ្នាំកំណើតៈ</span>
                  {dob ? (
                    <span
                      className="font-bold font-sans pl-1 truncate"
                      style={{ fontSize: `${Math.round(10.5 * s)}px` }}
                    >
                      {dob}
                    </span>
                  ) : (
                    renderDottedLine()
                  )}
                </div>
                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium">ទីកន្លែងកំណើតៈ</span>
                  {pob ? (
                    <span
                      className="font-semibold pl-1 truncate"
                      style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                    >
                      {pob}
                    </span>
                  ) : (
                    renderDottedLine()
                  )}
                </div>
                {/* ឪពុកឈ្មោះ & មុខរបរ */}
                <div className="flex items-baseline">
                  <div
                    className="flex items-baseline shrink-0"
                    style={{ width: `${Math.round(145 * s)}px` }}
                  >
                    <span className="shrink-0 font-medium">ឪពុកឈ្មោះៈ</span>
                    {fatherName ? (
                      <span
                        className="font-bold pl-1 truncate"
                        style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                      >
                        {fatherName}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                  <div className="flex items-baseline flex-1 min-w-0 pl-1">
                    <span className="shrink-0 font-medium">មុខរបរ</span>
                    {fatherJob ? (
                      <span
                        className="font-bold pl-1 truncate"
                        style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                      >
                        {fatherJob}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                </div>
                {/* ម្តាយឈ្មោះ & មុខរបរ */}
                <div className="flex items-baseline">
                  <div
                    className="flex items-baseline shrink-0"
                    style={{ width: `${Math.round(145 * s)}px` }}
                  >
                    <span className="shrink-0 font-medium">ម្តាយឈ្មោះៈ</span>
                    {motherName ? (
                      <span
                        className="font-bold pl-1 truncate"
                        style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                      >
                        {motherName}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                  <div className="flex items-baseline flex-1 min-w-0 pl-1">
                    <span className="shrink-0 font-medium">មុខរបរ</span>
                    {motherJob ? (
                      <span
                        className="font-bold pl-1 truncate"
                        style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                      >
                        {motherJob}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium">ទីលំនៅបច្ចុប្បន្នៈ</span>
                  {address ? (
                    <span
                      className="font-semibold pl-1 truncate"
                      style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                    >
                      {address}
                    </span>
                  ) : (
                    renderDottedLine()
                  )}
                </div>
              </div>

              {/* 4. FOOTER SIGNATURES & NAME AREA (Always anchored at bottom with plenty buffer) */}
              <div
                style={{
                  color: blueColor,
                  fontSize: `${Math.round(8.5 * s)}px`,
                  marginTop: 'auto',
                  paddingTop: `${Math.round(3 * s)}px`,
                }}
                className="leading-tight flex flex-col justify-end"
              >
                <div className="flex justify-between items-start">
                  {/* Left: Director Signature Block */}
                  <div
                    className="text-center flex flex-col items-center"
                    style={{ width: `${Math.round(135 * s)}px` }}
                  >
                    <div>{template.issueDateLine}</div>
                    <div
                      className="font-battambang font-bold mt-[2px]"
                      style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                    >
                      {template.directorTitle}
                    </div>
                    {/* Dedicated writing & stamping space */}
                    <div
                      className="w-full flex items-center justify-center"
                      style={{ height: `${Math.round(18 * s)}px` }}
                    >
                      <div
                        className="border-b border-dotted border-current opacity-30"
                        style={{ width: `${Math.round(85 * s)}px` }}
                      />
                    </div>
                    {/* Name underneath */}
                    <div
                      className="font-battambang font-bold tracking-wide text-center"
                      style={{ fontSize: `${Math.round(10 * s)}px` }}
                    >
                      {template.directorName || 'ជា សារ៉ា'}
                    </div>
                  </div>

                  {/* Right: Student Signature Block */}
                  <div
                    className="text-center flex flex-col items-center"
                    style={{
                      width: `${Math.round(125 * s)}px`,
                      paddingTop: `${Math.round(10 * s)}px`,
                    }}
                  >
                    <div
                      className="font-battambang font-medium"
                      style={{ fontSize: `${Math.round(9 * s)}px` }}
                    >
                      {template.signatureTitle}
                    </div>
                    {/* Dedicated student writing/signing space */}
                    <div
                      className="w-full flex items-center justify-center"
                      style={{ height: `${Math.round(18 * s)}px` }}
                    >
                      <div
                        className="border-b border-dotted border-current opacity-30"
                        style={{ width: `${Math.round(75 * s)}px` }}
                      />
                    </div>
                    {/* Name underneath */}
                    <div
                      className="font-battambang font-bold tracking-wide text-center truncate max-w-[120px]"
                      style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                    >
                      {nameKm || '........................'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. VARIANT 2: BOTTOM-PHOTO (Battambang Style)             */}
          {/* ======================================================== */}
          {!isLandscape && isBottomPhoto && (
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="text-center pt-[1px]">
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(10.5 * s)}px`,
                    lineHeight: `${Math.round(15 * s)}px`,
                  }}
                  className="font-moul tracking-wide"
                >
                  {template.countryHeaderKm1}
                </div>
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(9.5 * s)}px`,
                    lineHeight: `${Math.round(14 * s)}px`,
                    marginTop: `${Math.round(2 * s)}px`,
                  }}
                  className="font-moul tracking-wide"
                >
                  {template.countryHeaderKm2}
                </div>

                <div className="flex items-center justify-center gap-1.5 my-[2px] opacity-90">
                  <span
                    style={{
                      backgroundColor: blueColor,
                      width: `${Math.round(40 * s)}px`,
                      height: '1px',
                    }}
                    className="inline-block"
                  />
                  <span
                    className="font-bold"
                    style={{ fontSize: `${Math.round(10 * s)}px` }}
                  >
                    ៚
                  </span>
                  <span
                    style={{
                      backgroundColor: blueColor,
                      width: `${Math.round(40 * s)}px`,
                      height: '1px',
                    }}
                    className="inline-block"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 mt-[2px]">
                  <img
                    src={emblemSource}
                    alt="MoEYS Emblem"
                    style={{
                      width: `${Math.round(24 * s)}px`,
                      height: `${Math.round(28 * s)}px`,
                    }}
                    className="object-contain shrink-0"
                  />
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(9 * s)}px`,
                      lineHeight: `${Math.round(13 * s)}px`,
                    }}
                    className="font-battambang font-bold tracking-tight"
                  >
                    {template.ministryDepartment}
                  </div>
                </div>
              </div>

              <div
                className="text-center"
                style={{ margin: `${Math.round(2 * s)}px 0` }}
              >
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(13 * s)}px`,
                    lineHeight: `${Math.round(18 * s)}px`,
                  }}
                  className="font-moul tracking-wide"
                >
                  {template.cardTitleKm}
                </div>
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(9 * s)}px`,
                    marginTop: `${Math.round(1 * s)}px`,
                  }}
                  className="font-battambang"
                >
                  {academicYear ? (
                    <span>ឆ្នាំសិក្សា {academicYear}</span>
                  ) : (
                    <span>{template.academicYearPrefix}</span>
                  )}
                </div>
                <div
                  style={{
                    color: blueColor,
                    fontSize: `${Math.round(11 * s)}px`,
                    lineHeight: `${Math.round(16 * s)}px`,
                    marginTop: `${Math.round(1 * s)}px`,
                  }}
                  className="font-moul"
                >
                  ថ្នាក់ទី {studentClass || '12 "A"'}
                </div>
              </div>

              <div
                style={{
                  color: blueColor,
                  fontSize: `${Math.round(9 * s)}px`,
                  lineHeight: `${Math.round(15 * s)}px`,
                  gap: `${Math.round(4 * s)}px`,
                }}
                className="flex flex-col px-1 my-[2px]"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline flex-1">
                    <span className="shrink-0 font-medium">គោត្តនាម នាម</span>
                    {nameKm ? (
                      <span
                        className="font-bold pl-2 truncate"
                        style={{ fontSize: `${Math.round(12 * s)}px` }}
                      >
                        {nameKm}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 pl-3">
                    <span className="shrink-0 font-medium">ភេទ</span>
                    <span
                      className="text-center font-bold"
                      style={{
                        width: `${Math.round(35 * s)}px`,
                        fontSize: `${Math.round(10 * s)}px`,
                      }}
                    >
                      {gender || '...'}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium">ថ្ងៃខែឆ្នាំកំណើតៈ</span>
                  {dob ? (
                    <span
                      className="font-bold font-sans pl-2 truncate"
                      style={{ fontSize: `${Math.round(11 * s)}px` }}
                    >
                      {dob}
                    </span>
                  ) : (
                    renderDottedLine()
                  )}
                </div>

                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium">ទីកន្លែងកំណើតៈ</span>
                  {pob ? (
                    <span
                      className="font-semibold pl-2 truncate"
                      style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                    >
                      {pob}
                    </span>
                  ) : (
                    renderDottedLine()
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline flex-1">
                    <span className="shrink-0 font-medium">ឪពុកឈ្មោះៈ</span>
                    {fatherName ? (
                      <span
                        className="font-semibold pl-2 truncate"
                        style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                      >
                        {fatherName}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                  <div className="flex items-baseline flex-1 pl-2">
                    <span className="shrink-0 font-medium">ម្តាយឈ្មោះៈ</span>
                    {motherName ? (
                      <span
                        className="font-semibold pl-2 truncate"
                        style={{ fontSize: `${Math.round(9.5 * s)}px` }}
                      >
                        {motherName}
                      </span>
                    ) : (
                      renderDottedLine()
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Photo Box Strictly 3:4 & Director Block */}
              <div
                className="flex items-end gap-3 mt-auto"
                style={{ paddingTop: `${Math.round(4 * s)}px` }}
              >
                <div
                  style={{
                    borderColor: blueColor,
                    borderWidth: `${Math.max(1, 1.2 * s)}px`,
                    width: `${Math.round(84 * s)}px`,
                    height: `${Math.round(112 * s)}px`, // Strictly 3:4 ratio (84:112)
                  }}
                  className="border border-solid bg-slate-50/20 shrink-0 flex items-center justify-center relative overflow-hidden"
                >
                  {student?.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt="Student Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      style={{ color: blueColor, fontSize: `${Math.round(12 * s)}px` }}
                      className="font-bold font-sans tracking-wider opacity-70"
                    >
                      {template.photoBoxText || '3 x 4'}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-end text-center pb-0.5">
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(9.5 * s)}px`,
                    }}
                    className="font-battambang font-medium"
                  >
                    {template.studentDeclaration || 'ជាសិស្ស អនុវិទ្យាល័យ ដំណាក់ព្រីង'}
                  </div>
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(8.5 * s)}px`,
                      marginTop: `${Math.round(3 * s)}px`,
                    }}
                  >
                    {template.issueDateLine}
                  </div>
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(10.5 * s)}px`,
                      marginTop: `${Math.round(2 * s)}px`,
                    }}
                    className="font-battambang font-bold"
                  >
                    {template.directorTitle}
                  </div>
                  <div
                    className="w-full flex items-center justify-center"
                    style={{ height: `${Math.round(30 * s)}px` }}
                  >
                    <div
                      className="border-b border-dotted border-current opacity-30"
                      style={{ width: `${Math.round(85 * s)}px` }}
                    />
                  </div>
                  <div
                    style={{
                      color: blueColor,
                      fontSize: `${Math.round(10.5 * s)}px`,
                    }}
                    className="font-battambang font-bold tracking-wide"
                  >
                    {template.directorName || 'ជា សារ៉ា'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
