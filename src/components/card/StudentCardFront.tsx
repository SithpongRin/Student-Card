import React from 'react';
import { Student } from '../../types/student';
import { CardTemplate } from '../../types/template';
import { toKhmerNumerals, toArabicNumerals } from '../../utils/khmerNumerals';
import { MOEYS_EMBLEM_DATA_URI, getAssetUrl, getDefaultFlourishUrl } from '../../utils/assets';

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

  const blueColor = template.primaryColor || '#163d7e';
  const isBottomPhoto = template.variant === 'bottom-photo';

  // Format display school name (e.g. if 'អនុវិទ្យាល័យដំណាក់ព្រីង' or 'ដំណាក់ព្រីង')
  const displaySchoolName = template.schoolNameOnly
    ? template.schoolNameOnly.replace(/^អនុ[\/\s]*វិទ្យាល័យ\s*/, '')
    : '';

  // Safe Emblem & Flourish Sources (Embedded Data URI fallback ensures logo NEVER disappears)
  const emblemSource =
    template.emblemUrl && !template.emblemUrl.includes('moeys_emblem.svg') && (template.emblemUrl.startsWith('data:') || template.emblemUrl.startsWith('http'))
      ? template.emblemUrl
      : MOEYS_EMBLEM_DATA_URI;
  const flourishSource = getAssetUrl(template.flourishUrl) || getDefaultFlourishUrl();

  // Format student details: Class and Date of Birth must be written in Arabic numerals
  const nameKm = student?.nameKm || '';
  const gender = student?.gender || '';
  const nationality = student?.nationality || (student?.nameKm ? 'ខ្មែរ' : '');
  const studentClass = student?.class ? toArabicNumerals(student.class) : '';
  const studentId = student?.studentId || '';
  const cardNumber = student?.cardNumber 
    ? toKhmerNumerals(student.cardNumber) 
    : (studentId ? toKhmerNumerals(studentId) : '');
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
        }}
        className={`relative bg-white text-[${blueColor}] font-battambang p-[6px] box-border ${
          showCuttingBorder ? 'border border-dashed border-slate-300' : ''
        }`}
      >
        {/* Outer Solid Blue Border */}
        <div
          style={{
            borderColor: blueColor,
            borderWidth: '1.2px',
          }}
          className="relative w-full h-full border border-solid p-[5px] flex flex-col overflow-hidden"
        >
          {/* Centered Watermark Logo (MoEYS emblem) */}
          {template.showWatermark && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{
                opacity: template.watermarkOpacity || 0.16,
                transform: isBottomPhoto ? 'translateY(0px)' : 'translateY(20px)',
              }}
            >
              <img
                src={emblemSource}
                alt="MoEYS Watermark"
                className="w-[170px] h-[170px] object-contain"
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* LANDSCAPE LAYOUT (e.g. 86mm x 54mm CR80 Landscape)       */}
          {/* ======================================================== */}
          {isLandscape && (
            <div className="relative z-10 flex h-full gap-3 p-1">
              {/* Left Column: 3x4 Photo Box + ID */}
              <div className="flex flex-col items-center justify-between shrink-0" style={{ width: '135px' }}>
                <div
                  style={{
                    borderColor: blueColor,
                    borderWidth: '1.2px',
                    width: '135px',
                    height: '180px',
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
                      style={{ color: blueColor }}
                      className="text-[13px] font-bold font-sans tracking-wider opacity-70"
                    >
                      {template.photoBoxText || '3 x 4'}
                    </div>
                  )}
                </div>
                <div
                  style={{ color: blueColor }}
                  className="font-battambang font-bold text-[10px] text-center mt-1 truncate w-full"
                >
                  {studentId ? `អត្តលេខៈ ${studentId}` : 'អត្តលេខៈ ...........'}
                </div>
              </div>

              {/* Right Column: Headers, Title, Student Details, Signatures */}
              <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                {/* Top Headers */}
                <div className="text-center">
                  <div
                    style={{ color: blueColor }}
                    className="font-moul text-[10px] leading-[14px] tracking-wide"
                  >
                    {template.countryHeaderKm1}
                  </div>
                  <div
                    style={{ color: blueColor }}
                    className="font-moul text-[9px] leading-[13px] tracking-wide"
                  >
                    {template.countryHeaderKm2}
                  </div>

                  {/* Ministry & School */}
                  <div className="flex items-center gap-1.5 mt-1 text-left">
                    <img
                      src={emblemSource}
                      alt="MoEYS Emblem"
                      className="w-[16px] h-[20px] object-contain shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        style={{ color: blueColor }}
                        className="font-battambang font-bold text-[9px] leading-[12px] truncate"
                      >
                        {template.ministryDepartment}
                      </div>
                      <div
                        style={{ color: blueColor }}
                        className="font-battambang text-[8px] leading-[11px] truncate"
                      >
                        <span className="font-semibold">អនុ/វិទ្យាល័យ </span>
                        <span className="font-bold">{displaySchoolName || '................'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div
                    style={{ color: blueColor }}
                    className="font-moul text-[10px] leading-[14px] mt-1"
                  >
                    {template.cardTitleKm}
                  </div>
                </div>

                {/* Details */}
                <div
                  style={{ color: blueColor }}
                  className="space-y-[3px] text-[8.5px] leading-[12px] font-battambang"
                >
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">គោត្តនាម-នាមៈ</span>
                    <span className="flex-1 pl-1 truncate">
                      {nameKm ? (
                        <span className="font-bold text-[10px]">{nameKm}</span>
                      ) : (
                        <span className="opacity-70">....................</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[8px]">
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
                    <span className="flex-1 pl-1 truncate">
                      {dob ? (
                        <span className="font-bold font-sans text-[8.5px]">{dob}</span>
                      ) : (
                        <span className="opacity-70">....................</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">ទីលំនៅៈ</span>
                    <span className="flex-1 pl-1 truncate text-[8px]">
                      {address || <span className="opacity-70">....................</span>}
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div
                  style={{ color: blueColor }}
                  className="flex items-end justify-between text-[7.5px] leading-tight pt-1 border-t border-blue-100"
                >
                  <div className="text-left">
                    <div>{template.issueDateLine || 'ថ្ងៃទី...ខែ...ឆ្នាំ២០...'}</div>
                    <div className="font-bold text-[8px]">
                      {template.directorTitle || 'នាយក'}: {template.directorName || 'ជា សារ៉ា'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div>{template.signatureTitle || 'ហត្ថលេខាសាមីខ្លួន'}</div>
                    <div className="font-bold text-[8px]">
                      {nameKm || '................'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VARIANT 1: TOP-PHOTO (Exact Clone of Reference Image 1) */}
          {/* ======================================================== */}
          {!isLandscape && !isBottomPhoto && (
            <div className="relative z-10 flex flex-col h-full">
              {/* 1. Header (Centered) */}
              <div className="text-center pt-[1px]">
                <div
                  style={{ color: blueColor }}
                  className="font-moul text-[12px] leading-[17px] tracking-wide"
                >
                  {template.countryHeaderKm1}
                </div>
                <div
                  style={{ color: blueColor }}
                  className="font-moul text-[11px] leading-[16px] tracking-wide mt-[1px]"
                >
                  {template.countryHeaderKm2}
                </div>

                {/* Flourish: ផ្នែកខាងក្រោមព្រះរាជា */}
                <div className="flex items-center justify-center my-[2px]">
                  <img
                    src={flourishSource}
                    alt="Flourish"
                    className="w-[155px] h-[17px] object-contain opacity-95"
                  />
                </div>

                {/* Ministry & School (Logo centered & level with the two lines) */}
                <div className="flex items-center gap-1.5 mt-[2px] text-left">
                  <img
                    src={emblemSource}
                    alt="MoEYS Emblem"
                    className="w-[20px] h-[27px] object-contain shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      style={{ color: blueColor }}
                      className="font-battambang font-bold text-[10.5px] leading-[15px] tracking-tight truncate"
                    >
                      {template.ministryDepartment}
                    </div>
                    <div
                      style={{ color: blueColor }}
                      className="font-battambang text-[9.5px] leading-[14px] tracking-tight flex items-baseline gap-1 mt-[1px]"
                    >
                      <span className="shrink-0 font-semibold">អនុ/វិទ្យាល័យ</span>
                      <span className="flex-1 truncate">
                        {displaySchoolName ? (
                          <span className="font-bold text-[10.5px]">{displaySchoolName}</span>
                        ) : (
                          <span className="tracking-[2px] font-normal opacity-70 text-[8.5px]">
                            ...................................................
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Photo Box on Left & Title/Fields on Right (Standalone photo box matching reference) */}
              <div className="flex items-stretch mt-[4px] gap-2">
                {/* 3x4 Photo Box on Left (with standard margins and thin blue border) */}
                <div
                  style={{
                    borderColor: blueColor,
                    borderWidth: '1.2px',
                  }}
                  className="w-[84px] h-[112px] border border-solid bg-slate-50/20 shrink-0 flex items-center justify-center relative overflow-hidden"
                >
                  {student?.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt="Student Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      style={{ color: blueColor }}
                      className="text-[13px] font-bold font-sans tracking-wider opacity-70"
                    >
                      {template.photoBoxText || '3 x 4'}
                    </div>
                  )}
                </div>

                {/* Right of Photo Box: Title + 5 rows */}
                <div className="flex-1 flex flex-col justify-between py-[1px] min-w-0">
                  <div className="text-center">
                    <div
                      style={{ color: blueColor }}
                      className="font-moul text-[13px] leading-[19px] tracking-wide"
                    >
                      {template.cardTitleKm}
                    </div>
                    <div
                      style={{ color: blueColor }}
                      className="text-[9.5px] leading-tight flex items-center justify-center gap-1 mt-[1px]"
                    >
                      <span className="font-medium">{template.cardNumberPrefix}</span>
                      {cardNumber ? (
                        <span className="font-bold text-[10.5px]">{cardNumber}</span>
                      ) : (
                        <span className="font-normal opacity-70">........................</span>
                      )}
                    </div>
                    <div
                      style={{ color: blueColor }}
                      className="text-[9px] leading-tight text-center mt-[1px]"
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

                  {/* 3 rows beside photo: BOLD Important Fields & NO DOTS when filled */}
                  <div
                    style={{ color: blueColor }}
                    className="space-y-[3.5px] text-[9.5px] leading-[15px]"
                  >
                    <div className="flex items-baseline">
                      <span className="shrink-0 font-medium text-[9.5px]">គោត្តនាម-នាមៈ</span>
                      <span className="flex-1 pl-1 truncate">
                        {nameKm ? (
                          <span className="font-bold text-[12px] tracking-wide">{nameKm}</span>
                        ) : (
                          <span className="font-normal opacity-70 text-[8.5px]">........................</span>
                        )}
                      </span>
                    </div>
                    {/* Row 2: ភេទ & សញ្ជាតិ */}
                    <div className="flex items-baseline text-[9.5px]">
                      <div className="flex items-baseline w-[86px]">
                        <span className="shrink-0 font-medium">ភេទ</span>
                        <span className="pl-1 truncate">
                          {gender ? (
                            <span className="font-bold text-[10.5px]">{gender}</span>
                          ) : (
                            <span className="font-normal opacity-70 text-[8.5px]">......</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-baseline flex-1 min-w-0">
                        <span className="shrink-0 font-medium">សញ្ជាតិ</span>
                        <span className="pl-1 truncate">
                          {nationality ? (
                            <span className="font-bold text-[10.5px]">{nationality}</span>
                          ) : (
                            <span className="font-normal opacity-70 text-[8.5px]">......</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: ថ្នាក់ទី & អត្តលេខ */}
                    <div className="flex items-baseline text-[9.5px]">
                      <div className="flex items-baseline w-[86px]">
                        <span className="shrink-0 font-medium">ថ្នាក់ទី</span>
                        <span className="pl-1 truncate">
                          {studentClass ? (
                            <span className="font-bold text-[11px] font-sans">{studentClass}</span>
                          ) : (
                            <span className="font-normal opacity-70 text-[8.5px]">......</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-baseline flex-1 min-w-0">
                        <span className="shrink-0 font-medium">អត្តលេខៈ</span>
                        <span className="pl-1 truncate">
                          {studentId ? (
                            <span className="font-bold text-[10.5px] font-sans">{studentId}</span>
                          ) : (
                            <span className="font-normal opacity-70 text-[8.5px]">......</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 5 Full Width Lines below Photo Box: BOLD Important Values & NO DOTS when filled */}
              <div
                style={{ color: blueColor }}
                className="flex flex-col gap-[7px] text-[9.5px] leading-[15px] mt-[8px]"
              >
                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium text-[9.5px]">ថ្ងៃខែឆ្នាំកំណើតៈ</span>
                  <span className="flex-1 pl-1 truncate">
                    {dob ? (
                      <span className="font-bold text-[11px] font-sans">{dob}</span>
                    ) : (
                      <span className="font-normal opacity-70 text-[8.5px]">....................................................................</span>
                    )}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium text-[9.5px]">ទីកន្លែងកំណើតៈ</span>
                  <span className="flex-1 pl-1 truncate">
                    {pob ? (
                      <span className="font-semibold text-[10px]">{pob}</span>
                    ) : (
                      <span className="opacity-70 text-[8.5px]">....................................................................</span>
                    )}
                  </span>
                </div>
                {/* ឪពុកឈ្មោះ & មុខរបរ (មុខរបរ shifted left, aligned at ~52%) */}
                <div className="flex items-baseline">
                  <div className="flex items-baseline w-[152px]">
                    <span className="shrink-0 font-medium text-[9.5px]">ឪពុកឈ្មោះៈ</span>
                    <span className="pl-1 truncate flex-1">
                      {fatherName ? (
                        <span className="font-bold text-[10.5px]">{fatherName}</span>
                      ) : (
                        <span className="opacity-70 text-[8.5px]">..........................</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline flex-1 min-w-0 pl-1">
                    <span className="shrink-0 font-medium text-[9.5px]">មុខរបរ</span>
                    <span className="pl-1 truncate flex-1">
                      {fatherJob ? (
                        <span className="font-bold text-[10.5px]">{fatherJob}</span>
                      ) : (
                        <span className="opacity-70 text-[8.5px]">....................</span>
                      )}
                    </span>
                  </div>
                </div>
                {/* ម្តាយឈ្មោះ & មុខរបរ (មុខរបរ shifted left, aligned at ~52%) */}
                <div className="flex items-baseline">
                  <div className="flex items-baseline w-[152px]">
                    <span className="shrink-0 font-medium text-[9.5px]">ម្តាយឈ្មោះៈ</span>
                    <span className="pl-1 truncate flex-1">
                      {motherName ? (
                        <span className="font-bold text-[10.5px]">{motherName}</span>
                      ) : (
                        <span className="opacity-70 text-[8.5px]">..........................</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline flex-1 min-w-0 pl-1">
                    <span className="shrink-0 font-medium text-[9.5px]">មុខរបរ</span>
                    <span className="pl-1 truncate flex-1">
                      {motherJob ? (
                        <span className="font-bold text-[10.5px]">{motherJob}</span>
                      ) : (
                        <span className="opacity-70 text-[8.5px]">....................</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium text-[9.5px]">ទីលំនៅបច្ចុប្បន្នៈ</span>
                  <span className="flex-1 pl-1 truncate">
                    {address ? (
                      <span className="font-semibold text-[10px]">{address}</span>
                    ) : (
                      <span className="opacity-70 text-[8.5px]">....................................................................</span>
                    )}
                  </span>
                </div>
              </div>

              {/* 4. FOOTER SIGNATURES & NAME AREA (កន្លែងសរសេរ & ឈ្មោះពីក្រោម) */}
              <div
                style={{ color: blueColor }}
                className="pt-3 text-[9px] leading-tight flex flex-col justify-end mt-auto pb-1"
              >
                <div className="flex justify-between items-start">
                  {/* Left: Director Signature Block */}
                  <div className="text-center w-[135px] flex flex-col items-center">
                    <div>{template.issueDateLine}</div>
                    <div className="font-battambang font-bold text-[10.5px] mt-[2px]">
                      {template.directorTitle}
                    </div>
                    {/* Dedicated writing & stamping space */}
                    <div className="h-[34px] w-full flex items-center justify-center">
                      <div className="w-[90px] border-b border-dotted border-current opacity-30" />
                    </div>
                    {/* Name underneath */}
                    <div className="font-battambang font-bold text-[10.5px] tracking-wide text-center">
                      {template.directorName || 'ជា សារ៉ា'}
                    </div>
                  </div>

                  {/* Right: Student Signature Block */}
                  <div className="text-center w-[125px] flex flex-col items-center pt-[15px]">
                    <div className="font-battambang font-medium text-[9.5px]">
                      {template.signatureTitle}
                    </div>
                    {/* Dedicated student writing/signing space */}
                    <div className="h-[34px] w-full flex items-center justify-center">
                      <div className="w-[90px] border-b border-dotted border-current opacity-40" />
                    </div>
                    {/* Name underneath */}
                    <div className="font-battambang font-bold text-[10px] truncate max-w-[115px] text-center">
                      {nameKm || <span className="opacity-60 font-normal">........................</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VARIANT 2: BOTTOM-PHOTO (Battambang Style from Reference) */}
          {/* ======================================================== */}
          {!isLandscape && isBottomPhoto && (
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="text-center pt-[1px]">
                <div
                  style={{ color: blueColor }}
                  className="font-moul text-[10.5px] leading-[15px] tracking-wide"
                >
                  {template.countryHeaderKm1}
                </div>
                <div
                  style={{ color: blueColor }}
                  className="font-moul text-[9.5px] leading-[14px] tracking-wide mt-[2px]"
                >
                  {template.countryHeaderKm2}
                </div>

                <div className="flex items-center justify-center gap-1.5 my-[2px] opacity-90">
                  <span
                    style={{ backgroundColor: blueColor }}
                    className="w-10 h-[1px] inline-block"
                  />
                  <span className="text-[10px] font-bold">៚</span>
                  <span
                    style={{ backgroundColor: blueColor }}
                    className="w-10 h-[1px] inline-block"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 mt-[2px]">
                  <img
                    src={emblemSource}
                    alt="MoEYS Emblem"
                    className="w-[24px] h-[28px] object-contain shrink-0"
                  />
                  <div
                    style={{ color: blueColor }}
                    className="font-battambang font-bold text-[9px] leading-[13px] tracking-tight"
                  >
                    {template.ministryDepartment}
                  </div>
                </div>
              </div>

              <div className="text-center my-[3px]">
                <div
                  style={{ color: blueColor }}
                  className="font-moul text-[13px] leading-[18px] tracking-wide"
                >
                  {template.cardTitleKm}
                </div>
                <div
                  style={{ color: blueColor }}
                  className="text-[9px] font-battambang mt-[1px]"
                >
                  {academicYear ? (
                    <span>ឆ្នាំសិក្សា {academicYear}</span>
                  ) : (
                    <span>{template.academicYearPrefix}</span>
                  )}
                </div>
                <div
                  style={{ color: blueColor }}
                  className="font-moul text-[11px] leading-[16px] mt-[1px]"
                >
                  ថ្នាក់ទី {studentClass || '12 "A"'}
                </div>
              </div>

              <div
                style={{ color: blueColor }}
                className="space-y-[4px] text-[9px] leading-[16px] my-[2px] px-1"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline flex-1">
                    <span className="shrink-0 font-medium text-[9.5px]">គោត្តនាម នាម</span>
                    <span className="flex-1 pl-2 truncate">
                      {nameKm ? (
                        <span className="font-bold text-[12px]">{nameKm}</span>
                      ) : (
                        <span className="font-normal opacity-70 text-[8px]">........................</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 pl-3">
                    <span className="shrink-0 font-medium text-[9.5px]">ភេទ</span>
                    <span className="w-[35px] text-center">
                      {gender ? (
                        <span className="font-bold text-[10px]">{gender}</span>
                      ) : (
                        <span className="font-normal opacity-70 text-[8px]">......</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium text-[9.5px]">ថ្ងៃខែឆ្នាំកំណើតៈ</span>
                  <span className="flex-1 pl-2 truncate">
                    {dob ? (
                      <span className="font-bold text-[11px] font-sans">{dob}</span>
                    ) : (
                      <span className="font-normal opacity-70 text-[8px]">................................................</span>
                    )}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="shrink-0 font-medium text-[9.5px]">ទីកន្លែងកំណើតៈ</span>
                  <span className="flex-1 pl-2 truncate">
                    {pob ? (
                      <span className="font-semibold text-[9.5px]">{pob}</span>
                    ) : (
                      <span className="opacity-70 text-[8px]">................................................</span>
                    )}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline flex-1">
                    <span className="shrink-0 font-medium text-[9.5px]">ឪពុកឈ្មោះៈ</span>
                    <span className="flex-1 pl-2 truncate">
                      {fatherName ? (
                        <span className="font-semibold text-[9.5px]">{fatherName}</span>
                      ) : (
                        <span className="opacity-70 text-[8px]">....................</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline flex-1 pl-2">
                    <span className="shrink-0 font-medium text-[9.5px]">ម្តាយឈ្មោះៈ</span>
                    <span className="flex-1 pl-2 truncate">
                      {motherName ? (
                        <span className="font-semibold text-[9.5px]">{motherName}</span>
                      ) : (
                        <span className="opacity-70 text-[8px]">....................</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex items-end gap-3 pt-2 mt-auto">
                <div
                  style={{
                    borderColor: blueColor,
                    borderWidth: '1.2px',
                  }}
                  className="w-[84px] h-[106px] border border-solid bg-slate-50/20 shrink-0 flex items-center justify-center relative overflow-hidden"
                >
                  {student?.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt="Student Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      style={{ color: blueColor }}
                      className="text-[12px] font-bold font-sans tracking-wider opacity-70"
                    >
                      {template.photoBoxText || '3 x 4'}
                    </div>
                  )}
                </div>

                <div
                  style={{ color: blueColor }}
                  className="flex-1 text-center flex flex-col justify-between h-[106px] pb-1"
                >
                  <div className="space-y-[2px] text-[8.5px]">
                    <div className="font-battambang font-medium">
                      {template.studentDeclaration || `ជាសិស្ស ${template.schoolNameOnly || 'វិទ្យាល័យ អន្លង់វិល'}`}
                    </div>
                    <div>{template.issueDateLine}</div>
                  </div>

                  <div className="flex-1 flex items-center justify-center min-h-[30px]">
                    <div className="w-[85px] border-b border-dotted border-current opacity-30" />
                  </div>

                  <div className="font-moul text-[9.5px]">
                    {template.directorTitle || 'នាយកសាលា'}
                  </div>
                  {template.directorName && (
                    <div className="font-battambang font-bold text-[9px] mt-0.5 tracking-wide">
                      {template.directorName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
