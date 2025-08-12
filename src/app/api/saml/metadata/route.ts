import { NextRequest, NextResponse } from 'next/server';
import { SamlIdpService } from '@/backend/domains/sso/services/saml-idp-fixed.service';
import { DOMParser } from 'xmldom';

export async function GET() {
    try {
        const samlService = SamlIdpService.getInstance();
        const metadata = samlService.getMetadata();

        // Parse and validate the metadata
        const parser = new DOMParser();
        const doc = parser.parseFromString(metadata, 'text/xml');

        const errors = [];
        const warnings = [];

        // Basic validation checks
        const entityDescriptor = doc.getElementsByTagName('md:EntityDescriptor')[0];
        if (!entityDescriptor) {
            errors.push('Missing EntityDescriptor element');
        }

        const idpDescriptor = doc.getElementsByTagName('md:IDPSSODescriptor')[0];
        if (!idpDescriptor) {
            errors.push('Missing IDPSSODescriptor element');
        }

        const ssoService = doc.getElementsByTagName('md:SingleSignOnService')[0];
        if (!ssoService) {
            warnings.push('Missing SingleSignOnService endpoint');
        }

        const keyDescriptor = doc.getElementsByTagName('md:KeyDescriptor')[0];
        if (!keyDescriptor) {
            warnings.push('Missing KeyDescriptor (certificate)');
        }

        return NextResponse.json({
            success: true,
            metadata,
            validation: {
                errors,
                warnings,
                isValid: errors.length === 0,
                elementCount: {
                    entityDescriptor: doc.getElementsByTagName('md:EntityDescriptor').length,
                    idpDescriptor: doc.getElementsByTagName('md:IDPSSODescriptor').length,
                    ssoService: doc.getElementsByTagName('md:SingleSignOnService').length,
                    keyDescriptor: doc.getElementsByTagName('md:KeyDescriptor').length,
                },
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
