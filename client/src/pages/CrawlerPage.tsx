import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Globe, Plus, Trash2, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertWebpageSchema, type Webpage } from "@shared/schema";

export default function CrawlerPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Query to fetch all webpages
  const { data: webpages, isLoading } = useQuery<Webpage[]>({
    queryKey: ['/api/webpages'],
  });

  // Form initialization with zod validation
  const form = useForm({
    resolver: zodResolver(insertWebpageSchema),
    defaultValues: {
      url: '',
      title: '',
      description: '',
      content: '',
    }
  });

  // Mutation to add a new webpage
  const addWebpageMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      return await apiRequest('/api/webpages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "वेबपेज सफलतापूर्वक जोड़ा गया",
        description: "वेबपेज को इंडेक्स में जोड़ दिया गया है",
        variant: "default",
      });
      
      // Reset form
      form.reset({
        url: '',
        title: '',
        description: '',
        content: '',
      });
      
      // Invalidate webpages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/webpages'] });
      
      setSubmitting(false);
    },
    onError: (error: any) => {
      console.error("Add webpage error:", error);
      toast({
        title: "वेबपेज जोड़ने में त्रुटि",
        description: error.message || "वेबपेज जोड़ने में समस्या हुई। कृपया फिर से प्रयास करें।",
        variant: "destructive",
      });
      setSubmitting(false);
    },
  });

  // Form submission handler
  const onSubmit = async (data: any) => {
    setSubmitting(true);
    addWebpageMutation.mutate(data);
  };

  return (
    <div className="flex-grow">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Add Webpage Form */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Plus size={20} className="mr-2 text-google-blue" /> 
                <span>नया वेबपेज जोड़ें</span>
              </h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>शीर्षक</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="वेबपेज का शीर्षक" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>विवरण</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="वेबपेज का संक्षिप्त विवरण" 
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>सामग्री</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="वेबपेज की मुख्य सामग्री" 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-google-blue hover:bg-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? "जोड़ा जा रहा है..." : "वेबपेज जोड़ें"}
                  </Button>
                </form>
              </Form>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium flex items-center text-blue-800">
                <AlertTriangle size={18} className="mr-2" />
                टिप्पणियाँ
              </h3>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• वेबपेज के सभी विवरण सही और पूर्ण होने चाहिए</li>
                <li>• URL अनिवार्य रूप से 'http://' या 'https://' से शुरू होना चाहिए</li>
                <li>• सामग्री में मुख्य पाठ्य जानकारी शामिल करें</li>
                <li>• कॉपीराइट सामग्री जोड़ने से पहले अनुमति सुनिश्चित करें</li>
              </ul>
            </div>
          </div>
          
          {/* Right Column: List of Indexed Webpages */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Globe size={20} className="mr-2 text-google-blue" />
                <span>इंडेक्सड वेबपेज</span>
              </h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-600">लोड हो रहा है...</p>
                </div>
              ) : !webpages || webpages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>कोई वेबपेज इंडेक्स नहीं किया गया है</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {webpages.map((webpage) => (
                    <div 
                      key={webpage.id} 
                      className="border rounded-md p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-blue-800">
                          {webpage.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          ID: {webpage.id}
                        </span>
                      </div>
                      
                      <a 
                        href={webpage.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline flex items-center mt-1"
                      >
                        {webpage.url}
                      </a>
                      
                      <p className="text-sm text-gray-600 mt-2">
                        {webpage.description}
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          अंतिम इंडेक्स: {new Date(webpage.lastIndexed).toLocaleString()}
                        </span>
                        
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                          onClick={() => {
                            toast({
                              title: "अभी उपलब्ध नहीं",
                              description: "यह सुविधा अभी विकास के अधीन है",
                              variant: "default",
                            });
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}