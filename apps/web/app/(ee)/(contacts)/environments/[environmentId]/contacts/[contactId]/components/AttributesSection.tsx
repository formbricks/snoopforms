import { getResponsesByContactId } from "@formbricks/lib/response/service";
import { capitalizeFirstLetter } from "@formbricks/lib/utils/strings";
import { getContact, getContactAttributes } from "../../lib/contacts";

export const AttributesSection = async ({ contactId }: { contactId: string }) => {
  const [contact, attributes] = await Promise.all([getContact(contactId), getContactAttributes(contactId)]);
  if (!contact) {
    throw new Error("No such person found");
  }

  const responses = await getResponsesByContactId(contactId);
  const numberOfResponses = responses?.length || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-700">Attributes</h2>
      <div>
        <dt className="text-sm font-medium text-slate-500">Email</dt>
        <dd className="ph-no-capture mt-1 text-sm text-slate-900">
          {attributes.email ? (
            <span>{attributes.email.value}</span>
          ) : (
            <span className="text-slate-300">Not provided</span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-slate-500">Language</dt>
        <dd className="ph-no-capture mt-1 text-sm text-slate-900">
          {attributes.language ? (
            <span>{attributes.language.value}</span>
          ) : (
            <span className="text-slate-300">Not provided</span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-slate-500">User Id</dt>
        <dd className="ph-no-capture mt-1 text-sm text-slate-900">
          {attributes.userId ? (
            <span>{attributes.userId.value}</span>
          ) : (
            <span className="text-slate-300">Not provided</span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-slate-500">Formbricks Id (internal)</dt>
        <dd className="ph-no-capture mt-1 text-sm text-slate-900">{contact.id}</dd>
      </div>

      {Object.entries(attributes)
        .filter(([key, _]) => key !== "email" && key !== "userId" && key !== "language")
        .map(([key, attributeData]) => (
          <div key={key}>
            <dt className="text-sm font-medium text-slate-500">
              {capitalizeFirstLetter((attributeData.name ?? key).toString())}
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{attributeData.value}</dd>
          </div>
        ))}
      <hr />

      <div>
        <dt className="text-sm font-medium text-slate-500">Responses</dt>
        <dd className="mt-1 text-sm text-slate-900">{numberOfResponses}</dd>
      </div>
    </div>
  );
};
