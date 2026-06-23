/**
 * contractorService — 1:1 port of Flutter's `ContractorService`
 * (lib/features/services/data/contractor_service.dart).
 *
 *   • Reads `contractors` where status == 'APPROVED', limit 10
 *   • For each contractor, reads `portfolio_items` where
 *     contractorId == doc.id AND approvalStatus == 'APPROVED' and splits
 *     the media into image gallery + video lists.
 */
import {
  collection, getDocs, limit, query, where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface TopContractor {
  docId: string;
  companyName: string;
  contactName: string;
  specialty: string;
  area: string;
  region: string;
  experience: string;
  rating: number;
  projectsCompleted: number;
  profileImageUrl: string;
  serviceCategories: string[];
  specializations: string[];
  galleryUrls: string[];
  videoUrls: string[];
  displayName: string;
  displaySpecialty: string;
  displayLocation: string;
}

export async function fetchTopContractors(max = 10): Promise<TopContractor[]> {
  try {
    const qContractors = query(
      collection(db, 'contractors'),
      where('status', '==', 'APPROVED'),
      limit(max),
    );
    const snap = await getDocs(qContractors);
    if (snap.empty) return [];

    const out: TopContractor[] = [];
    for (const doc of snap.docs) {
      const d = doc.data() as Record<string, any>;
      const galleryUrls: string[] = [];
      const videoUrls: string[] = [];
      try {
        const pSnap = await getDocs(
          query(
            collection(db, 'portfolio_items'),
            where('contractorId', '==', doc.id),
            where('approvalStatus', '==', 'APPROVED'),
          ),
        );
        pSnap.forEach((p) => {
          const pd = p.data() as Record<string, any>;
          const mediaType = String(pd.mediaType ?? 'IMAGE').toUpperCase();
          const url: string = pd.mediaUrl ?? pd.imageUrl ?? pd.videoUrl ?? '';
          if (!url) return;
          if (mediaType === 'VIDEO') videoUrls.push(url);
          else galleryUrls.push(url);
        });
      } catch { /* portfolio is optional */ }

      const companyName = String(d.companyName ?? '');
      const contactName = String(d.contactName ?? '');
      const area = String(d.area ?? '');
      const region = String(d.region ?? '');
      const specialty = String(d.specialty ?? '');
      const serviceCategories = Array.isArray(d.serviceCategories)
        ? d.serviceCategories.map(String) : [];
      const specializations = Array.isArray(d.specializations)
        ? d.specializations.map(String) : [];

      const displayName =
        companyName && companyName !== '—' ? companyName
          : contactName && contactName !== '—' ? contactName : doc.id;
      const displaySpecialty =
        specializations[0] || serviceCategories[0] || specialty || 'General Contractor';
      const displayLocation = (area && area !== '—') ? area : region;

      out.push({
        docId: doc.id, companyName, contactName, specialty, area, region,
        experience: String(d.experience ?? ''),
        rating: Number(d.rating ?? 0),
        projectsCompleted: Number(d.projectsCompleted ?? 0),
        profileImageUrl: String(d.profileImageUrl ?? ''),
        serviceCategories, specializations, galleryUrls, videoUrls,
        displayName, displaySpecialty, displayLocation,
      });
    }
    return out;
  } catch {
    return [];
  }
}
