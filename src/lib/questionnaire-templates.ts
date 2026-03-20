export interface TemplateQuestion {
  label: string;
  type: "text" | "textarea" | "yes_no" | "multiple_choice" | "dropdown";
  options?: string;
  required: boolean;
}

export interface QuestionnaireTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  assignOnJoin: boolean;
  questions: TemplateQuestion[];
}

export const QUESTIONNAIRE_TEMPLATES: QuestionnaireTemplate[] = [
  {
    id: "parq",
    title: "PAR-Q — Physical Activity Readiness Questionnaire",
    description:
      "Standard PAR-Q form for personal trainers. Identifies clients who should seek medical advice before starting an exercise programme.",
    category: "Personal Training",
    assignOnJoin: true,
    questions: [
      {
        label: "Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?",
        type: "yes_no",
        required: true,
      },
      {
        label: "Do you feel pain in your chest when you do physical activity?",
        type: "yes_no",
        required: true,
      },
      {
        label: "In the past month, have you had chest pain when you were NOT doing physical activity?",
        type: "yes_no",
        required: true,
      },
      {
        label: "Do you lose your balance because of dizziness, or do you ever lose consciousness?",
        type: "yes_no",
        required: true,
      },
      {
        label: "Do you have a bone or joint problem (e.g. back, knee, or hip) that could be made worse by a change in your physical activity?",
        type: "yes_no",
        required: true,
      },
      {
        label: "Is your doctor currently prescribing medication for your blood pressure or a heart condition?",
        type: "yes_no",
        required: true,
      },
      {
        label: "Do you know of any other reason why you should not do physical activity?",
        type: "yes_no",
        required: true,
      },
      {
        label: "If you answered YES to any question above, please provide details:",
        type: "textarea",
        required: false,
      },
      {
        label: "Do you have any current injuries or physical limitations we should be aware of?",
        type: "textarea",
        required: false,
      },
      {
        label: "Emergency contact name",
        type: "text",
        required: true,
      },
      {
        label: "Emergency contact phone number",
        type: "text",
        required: true,
      },
      {
        label: "I declare that the information I have provided is accurate and I understand that it is my responsibility to inform my trainer of any changes to my health status.",
        type: "yes_no",
        required: true,
      },
    ],
  },
  {
    id: "massage-health",
    title: "Massage Therapy Health Questionnaire",
    description:
      "Pre-treatment health intake form for massage therapists. Collects relevant medical history and treatment preferences.",
    category: "Massage Therapy",
    assignOnJoin: true,
    questions: [
      {
        label: "What is the main reason for your visit today?",
        type: "textarea",
        required: true,
      },
      {
        label: "Have you had a professional massage before?",
        type: "yes_no",
        required: false,
      },
      {
        label: "Do you have any of the following? (Please describe any relevant medical conditions, e.g. diabetes, arthritis, osteoporosis, cancer, epilepsy, blood clots)",
        type: "textarea",
        required: false,
      },
      {
        label: "Have you had any recent injuries, surgeries, or fractures in the past 12 months?",
        type: "yes_no",
        required: true,
      },
      {
        label: "If yes, please describe the injury or surgery:",
        type: "textarea",
        required: false,
      },
      {
        label: "Are you currently pregnant?",
        type: "yes_no",
        required: false,
      },
      {
        label: "Do you have any skin conditions, rashes, open wounds, or areas of inflammation?",
        type: "yes_no",
        required: true,
      },
      {
        label: "If yes, please describe and indicate the location:",
        type: "textarea",
        required: false,
      },
      {
        label: "Are you currently taking any medications (including blood thinners, pain relief, or anti-inflammatories)?",
        type: "yes_no",
        required: false,
      },
      {
        label: "If yes, please list them:",
        type: "textarea",
        required: false,
      },
      {
        label: "Do you have any allergies to oils, lotions, or fragrances?",
        type: "yes_no",
        required: true,
      },
      {
        label: "If yes, please specify:",
        type: "text",
        required: false,
      },
      {
        label: "Preferred massage pressure",
        type: "multiple_choice",
        options: "Light\nMedium\nFirm\nDeep tissue",
        required: true,
      },
      {
        label: "Areas to focus on (e.g. neck, lower back, shoulders)",
        type: "textarea",
        required: false,
      },
      {
        label: "Are there any areas you would like us to avoid?",
        type: "textarea",
        required: false,
      },
      {
        label: "I consent to massage therapy treatment and confirm that the information provided is accurate to the best of my knowledge.",
        type: "yes_no",
        required: true,
      },
    ],
  },
];
