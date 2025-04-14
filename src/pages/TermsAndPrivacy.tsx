
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsAndPrivacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">Terms of Service & Privacy Policy</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
            <div className="prose">
              <p>
                By using the Wellura App, you agree to the following terms and conditions:
              </p>
              <h3>1. Educational Purpose Only</h3>
              <p>
                The information provided through the Wellura App is for educational 
                purposes only and is not intended to diagnose, treat, cure, or prevent 
                any disease or health condition. We are not providing medical advice.
              </p>
              <h3>2. Consult Healthcare Professionals</h3>
              <p>
                Always consult with qualified healthcare professionals before starting 
                any new exercise program, diet, supplement regimen, or making changes to 
                existing treatment.
              </p>
              <h3>3. No FDA Evaluation</h3>
              <p>
                Statements regarding dietary supplements have not been evaluated by the Food 
                and Drug Administration (FDA) and are not intended to diagnose, treat, cure, 
                or prevent any disease.
              </p>
              <h3>4. Results May Vary</h3>
              <p>
                Individual results may vary. The testimonials and examples used are not 
                intended to represent or guarantee that anyone will achieve the same or 
                similar results.
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
            <div className="prose">
              <h3>1. Camera Usage</h3>
              <p>
                The Wellura App uses your device's camera to track exercise form during 
                workout sessions. No video or images are stored or transmitted from your device.
              </p>
              <h3>2. Personal Data</h3>
              <p>
                We collect personal information that you voluntarily provide to us, such as 
                name, email address, and fitness goals. This information is used to provide 
                and improve our services.
              </p>
              <h3>3. Health Data</h3>
              <p>
                Any health-related data you provide (such as weight, height, fitness level, etc.) 
                is stored securely and not shared with third parties without your explicit consent.
              </p>
              <h3>4. Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect your 
                personal data against unauthorized or unlawful processing, accidental loss, 
                destruction, or damage.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;
